//! Per-app audio routing: one private aggregate device per TARGET output,
//! with a muting process tap per routed app. The aggregate's IOProc mixes
//! the taps' input channels into the target device's output buffers.
//!
//! Layout invariants that keep the real-time IOProc simple and lock-free:
//! - every tap is a STEREO mixdown, so the tap at position `p` owns
//!   aggregate input channels `[2p, 2p+1]`;
//! - the target device is the aggregate's clock (main sub-device), so tap
//!   channels arrive resampled at the device rate and sample `i` in maps to
//!   sample `i` out;
//! - per-app volume lives in a fixed array of atomics indexed by tap
//!   position (never a lock).
//!
//! Permission model: without TCC "System Audio Recording" a tap exists but
//! delivers silence — while a muting tap still mutes. `route_app` therefore
//! always probes with an UNMUTED tap first (audio keeps playing normally),
//! measures RMS for ~600 ms (this attempt also triggers the macOS prompt on
//! first use), and only rebuilds the tap as muting once real samples arrive.

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use objc2_core_audio::{
    kAudioAggregateDeviceIsPrivateKey, kAudioAggregateDeviceMainSubDeviceKey,
    kAudioAggregateDeviceNameKey, kAudioAggregateDevicePropertyTapList,
    kAudioAggregateDeviceSubDeviceListKey, kAudioAggregateDeviceTapAutoStartKey,
    kAudioAggregateDeviceTapListKey, kAudioAggregateDeviceUIDKey,
    kAudioDevicePropertyDeviceIsAlive, kAudioSubDeviceDriftCompensationKey, kAudioSubDeviceUIDKey,
    AudioDeviceCreateIOProcID, AudioDeviceDestroyIOProcID, AudioDeviceIOProcID, AudioDeviceStart,
    AudioDeviceStop, AudioHardwareCreateAggregateDevice, AudioHardwareDestroyAggregateDevice,
    AudioObjectID,
};
use objc2_core_audio_types::{AudioBuffer, AudioBufferList, AudioTimeStamp};
use objc2_core_foundation::{
    CFArray, CFBoolean, CFDictionary, CFNumber, CFRetained, CFString, CFType,
};
use serde::Serialize;
use tauri::Manager;

use super::devices::find_id_by_uid;
use super::hal;
use super::notify;
use super::tap::{self, Tap};
use super::watch::Signal;

/// Borrow the managed app state for the duration of the call (with_state
/// can't hand out references — its guard drops at return).
fn state_of(app: &tauri::AppHandle) -> Result<tauri::State<'_, crate::state::AppState>, String> {
    app.try_state::<crate::state::AppState>()
        .ok_or_else(|| "State unavailable".into())
}

/// Max routed apps per target output.
const MAX_TAPS: usize = 8;
/// Aggregate input channels each tap contributes (stereo mixdown).
const TAP_CHANNELS: usize = 2;
/// RMS threshold for "real audio flowed through the probe tap".
const RMS_THRESHOLD: f32 = 1e-4;
/// Sentinel error the frontend matches to show the permission explainer.
pub const PERMISSION_REQUIRED: &str = "permission-required: grant System Audio Recording to Tavo";

/// Permission outcome for the TCC prompt. 0 = unknown, 1 = granted,
/// 2 = denied / unresolved.
static CAPTURE_STATE: AtomicU32 = AtomicU32::new(0);

pub fn capture_permission_granted() -> bool {
    CAPTURE_STATE.load(Ordering::Relaxed) == 1
}

pub fn capture_permission_state() -> u32 {
    CAPTURE_STATE.load(Ordering::Relaxed)
}

pub fn reset_capture_permission() {
    CAPTURE_STATE.store(0, Ordering::Relaxed);
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RouteEntry {
    pub pid: u32,
    pub app_name: String,
    pub target_uid: String,
    pub target_name: String,
    pub volume: f32,
}

struct TapEntry {
    pid: u32,
    app_name: String,
    process_object_id: AudioObjectID,
    /// `Some` while the tap is live in the aggregate's list; taken out before
    /// destruction so the HAL never references a destroyed tap.
    tap: Option<Tap>,
}

struct RouteCore {
    target_uid: String,
    target_name: String,
    target_device_id: AudioObjectID,
    aggregate_id: AudioObjectID,
    proc_id: std::sync::OnceLock<AudioDeviceIOProcID>,
    taps: Mutex<Vec<TapEntry>>,
    tap_count: AtomicUsize,
    /// f32 bits, indexed by tap position.
    gains: [AtomicU32; MAX_TAPS],
    /// Set while the permission probe measures input RMS.
    measuring_rms: AtomicBool,
    /// f32 bits of the last measured OUTPUT RMS (post-mix).
    rms: AtomicU32,
    /// f32 bits of the last measured INPUT RMS (pre-mix, straight from the
    /// tap channels).
    in_rms: AtomicU32,
    /// Input samples seen during the probe.
    in_samples: AtomicU64,
    /// Input buffer layout captured at probe start: "bufs=2 ch=[2,2] bytes=[256,256]".
    probe_layout: std::sync::Mutex<String>,
    /// Client pointer handed to CoreAudio (Arc allocation of self), kept so
    /// teardown can rebalance the reference count.
    client_ptr: AtomicUsize,
}

type RouteCoreArc = Arc<RouteCore>;

#[derive(Default)]
pub struct Router {
    routes: Mutex<HashMap<String, RouteCoreArc>>,
}

impl Router {
    fn find_pid(&self, pid: u32) -> Option<(String, usize)> {
        self.routes.lock().unwrap().iter().find_map(|(uid, core)| {
            let taps = core.taps.lock().unwrap();
            taps.iter()
                .position(|t| t.pid == pid)
                .map(|index| (uid.clone(), index))
        })
    }

    fn all_cores(&self) -> Vec<RouteCoreArc> {
        self.routes.lock().unwrap().values().cloned().collect()
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/// Route `pid`'s audio to the device with `target_uid`. Async: the first
/// route performs a ~600 ms permission probe.
pub async fn route_app(app: &tauri::AppHandle, pid: u32, target_uid: &str) -> Result<(), String> {
    if !tap::routing_supported() {
        return Err("Per-app routing needs macOS 14.2 or newer".into());
    }

    // Moving an already-routed app is a re-route.
    if pid_is_routed(app, pid) {
        unroute_app(app, pid)?;
    }

    let state = state_of(app)?;
    let router = &state.audio.router;
    let (process_object_id, target_device_id, app_name, target_name) =
        resolve_route_inputs(pid, target_uid)?;

    let (core, created) = get_or_create_core(router, target_uid, &target_name, target_device_id)?;

    // Tap creation with the permission probe dance.
    let tap = if capture_permission_granted() {
        Tap::create(&[process_object_id], &format!("tavo-{pid}"), true)?
    } else {
        match probe_and_build_tap(&core, process_object_id, pid).await {
            Ok(t) => t,
            Err(err) => {
                if created {
                    teardown_and_remove(&router.routes, target_uid);
                }
                return Err(err);
            }
        }
    };

    push_tap(
        router,
        &core,
        created,
        target_uid,
        NewTap {
            pid,
            app_name,
            process_object_id,
            tap,
        },
    )?;
    notify(app, Signal::State);
    Ok(())
}

// ---------------------------------------------------------------------------
// Shared route plumbing
// ---------------------------------------------------------------------------

fn pid_is_routed(app: &tauri::AppHandle, pid: u32) -> bool {
    super::with_state(app, |a| a.router.find_pid(pid).is_some()).unwrap_or(false)
}

/// Everything route_app needs before touching the router map.
type RouteInputs = (AudioObjectID, AudioObjectID, String, String);

fn resolve_route_inputs(pid: u32, target_uid: &str) -> Result<RouteInputs, String> {
    let process_object_id =
        tap::process_object_for_pid(pid).ok_or("App is not producing audio right now")?;
    let target_device_id = find_id_by_uid(target_uid).ok_or("Target device not found")?;
    let app_name = tap::list_audio_processes()
        .into_iter()
        .find(|p| p.pid == pid)
        .map(|p| p.name)
        .unwrap_or_else(|| format!("Process {pid}"));
    let target_name = super::devices::list_devices()
        .into_iter()
        .find(|d| d.uid == target_uid)
        .map(|d| d.name)
        .unwrap_or_else(|| "Output".into());
    Ok((process_object_id, target_device_id, app_name, target_name))
}

fn get_or_create_core(
    router: &Router,
    target_uid: &str,
    target_name: &str,
    target_device_id: AudioObjectID,
) -> Result<(RouteCoreArc, bool), String> {
    let mut routes = router.routes.lock().unwrap();
    if let Some(core) = routes.get(target_uid) {
        return Ok((Arc::clone(core), false));
    }
    // Guard: one aggregate per output is enforced by the map; cap taps at
    // push_tap. Creating here is safe.
    let core = create_route_core(target_uid, target_name, target_device_id)?;
    routes.insert(target_uid.to_string(), Arc::clone(&core));
    Ok((core, true))
}

/// Everything needed to attach one tap.
struct NewTap {
    pid: u32,
    app_name: String,
    process_object_id: AudioObjectID,
    tap: Tap,
}

/// Append a tap to the core's aggregate + bookkeeping. On failure, rolls the
/// bookkeeping back and tears the core down if we created it this call.
fn push_tap(
    router: &Router,
    core: &RouteCoreArc,
    created: bool,
    target_uid: &str,
    new_tap: NewTap,
) -> Result<(), String> {
    let NewTap {
        pid,
        app_name,
        process_object_id,
        tap,
    } = new_tap;
    if core.taps.lock().unwrap().len() >= MAX_TAPS {
        if created {
            teardown_and_remove(&router.routes, target_uid);
        }
        return Err(format!("At most {MAX_TAPS} apps can share one output"));
    }

    let mut taps = core.taps.lock().unwrap();
    taps.push(TapEntry {
        pid,
        app_name,
        process_object_id,
        tap: Some(tap),
    });
    let uuids: Vec<&str> = taps
        .iter()
        .map(|t| t.tap.as_ref().expect("just pushed").uuid.as_str())
        .collect();
    if let Err(err) = set_tap_list(core.aggregate_id, &uuids).and_then(|_| restart_io(core)) {
        let removed = taps.pop();
        if let Some(entry) = removed {
            drop(entry.tap);
        }
        if created {
            teardown_and_remove(&router.routes, target_uid);
        }
        return Err(err);
    }
    core.tap_count.store(taps.len(), Ordering::Relaxed);
    core.gains[taps.len() - 1].store(1.0f32.to_bits(), Ordering::Relaxed);
    Ok(())
}

/// Stop routing `pid`: remove its tap, and tear down the whole target route
/// if that was the last app on it.
pub fn unroute_app(app: &tauri::AppHandle, pid: u32) -> Result<(), String> {
    let state = state_of(app)?;
    let router = &state.audio.router;
    let (uid, index) = router.find_pid(pid).ok_or("App is not routed")?;
    let core = router
        .routes
        .lock()
        .unwrap()
        .get(&uid)
        .cloned()
        .ok_or("Route vanished")?;

    // Order matters: take the tap out of bookkeeping, update the aggregate
    // list, THEN destroy the tap.
    let taken = {
        let mut taps = core.taps.lock().unwrap();
        let mut entry = taps.remove(index);
        let tap = entry.tap.take();
        let uuids: Vec<&str> = taps
            .iter()
            .map(|t| t.tap.as_ref().expect("live entry").uuid.as_str())
            .collect();
        let result = set_tap_list(core.aggregate_id, &uuids).and_then(|_| restart_io(&core));
        core.tap_count.store(taps.len(), Ordering::Relaxed);
        result.map(|_| tap)
    };

    // List updated; now safe to destroy the tap.
    drop(taken);

    if core.taps.lock().unwrap().is_empty() {
        teardown_and_remove(&router.routes, &uid);
    }
    notify(app, Signal::State);
    Ok(())
}

/// Set a routed app's volume (0.0..=1.0).
pub fn set_app_volume(app: &tauri::AppHandle, pid: u32, volume: f32) -> Result<(), String> {
    let state = state_of(app)?;
    let (uid, index) = state
        .audio
        .router
        .find_pid(pid)
        .ok_or("App is not routed")?;
    let core = state
        .audio
        .router
        .routes
        .lock()
        .unwrap()
        .get(&uid)
        .cloned()
        .ok_or("App is not routed")?;
    core.gains[index].store(volume.clamp(0.0, 1.0).to_bits(), Ordering::Relaxed);
    Ok(())
}

/// Tear down every route.
pub fn stop_all(app: &tauri::AppHandle) -> Result<(), String> {
    let state = state_of(app)?;
    let pids: Vec<u32> = {
        let routes = state.audio.router.routes.lock().unwrap();
        routes
            .values()
            .flat_map(|core| {
                let taps = core.taps.lock().unwrap();
                taps.iter().map(|t| t.pid).collect::<Vec<_>>()
            })
            .collect()
    };
    for pid in pids {
        let _ = unroute_app(app, pid);
    }
    Ok(())
}

/// Current routing table (for snapshots).
pub fn route_entries(app: &tauri::AppHandle) -> Vec<RouteEntry> {
    let Ok(state) = state_of(app) else {
        return Vec::new();
    };
    let routes = state.audio.router.routes.lock().unwrap();
    routes
        .values()
        .flat_map(|core| {
            let taps = core.taps.lock().unwrap();
            taps.iter()
                .enumerate()
                .map(|(position, t)| RouteEntry {
                    pid: t.pid,
                    app_name: t.app_name.clone(),
                    target_uid: core.target_uid.clone(),
                    target_name: core.target_name.clone(),
                    volume: f32::from_bits(core.gains[position].load(Ordering::Relaxed)),
                })
                .collect::<Vec<_>>()
        })
        .collect()
}

/// Unroute taps whose process died or whose target device disappeared —
/// destroying a tap lifts its mute, so audio cleanly falls back to the
/// default output.
pub fn sweep_dead(app: &tauri::AppHandle) -> bool {
    let Ok(state) = state_of(app) else {
        return false;
    };
    let cores = state.audio.router.all_cores();
    let live_process_ids: Vec<u32> = tap::list_audio_processes()
        .into_iter()
        .map(|p| p.object_id)
        .collect();
    let mut changed = false;
    for core in cores {
        let target_dead = hal::get::<u32>(
            core.target_device_id,
            kAudioDevicePropertyDeviceIsAlive,
            hal::SCOPE_GLOBAL,
            hal::ELEMENT_MAIN,
        )
        .is_err();
        if target_dead {
            // Destroying the taps lifts their mutes; audio falls back to the
            // default output.
            teardown_and_remove(&state.audio.router.routes, &core.target_uid);
            changed = true;
            continue;
        }
        let dead: Vec<u32> = {
            let taps = core.taps.lock().unwrap();
            taps.iter()
                .filter(|t| !live_process_ids.contains(&t.process_object_id))
                .map(|t| t.pid)
                .collect()
        };
        for pid in dead {
            let _ = unroute_app(app, pid);
            changed = true;
        }
    }
    changed
}

// ---------------------------------------------------------------------------
// Auto-restore (routing rules) + presets
// ---------------------------------------------------------------------------

/// Cooldown so a failing rule doesn't retry on every audio event.
const AUTO_RETRY: Duration = Duration::from_secs(8);

fn auto_cooldown() -> &'static Mutex<HashMap<u32, std::time::Instant>> {
    static MAP: std::sync::OnceLock<Mutex<HashMap<u32, std::time::Instant>>> =
        std::sync::OnceLock::new();
    MAP.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Apply enabled routing rules: when an app whose name matches a rule is
/// producing audio and the rule's target device is connected, route it.
/// Requires capture permission to already be granted (rules are created via
/// the UI, which itself requires the permission — so this holds in
/// practice). Returns true when anything changed.
pub fn auto_restore(app: &tauri::AppHandle) -> bool {
    if !capture_permission_granted() || !tap::routing_supported() {
        return false;
    }
    let Ok(state) = state_of(app) else {
        return false;
    };

    let rules = {
        let conn = state.db.lock().unwrap();
        match crate::db::list_routing_rules(&conn) {
            Ok(rules) => rules.into_iter().filter(|r| r.enabled).collect::<Vec<_>>(),
            Err(_) => return false,
        }
    };
    if rules.is_empty() {
        return false;
    }

    let audible: Vec<tap::AudioProcess> = tap::list_audio_processes()
        .into_iter()
        .filter(|p| p.audible)
        .collect();
    if audible.is_empty() {
        return false;
    }

    let mut changed = false;
    let mut cooldown = auto_cooldown().lock().unwrap();
    let now = std::time::Instant::now();

    for rule in rules {
        // Match an audible app by name that isn't routed yet.
        let Some(process) = audible.iter().find(|p| {
            state.audio.router.find_pid(p.pid).is_none()
                && p.name.eq_ignore_ascii_case(&rule.app_name)
        }) else {
            continue;
        };
        if find_id_by_uid(&rule.target_uid).is_none() {
            continue; // target not connected
        }
        if let Some(last) = cooldown.get(&process.pid) {
            if now.duration_since(*last) < AUTO_RETRY {
                continue;
            }
        }
        cooldown.insert(process.pid, now);
        // find_pid inside attach_direct re-checks; route by matched pid.
        match attach_direct_named(app, process.pid, &rule.target_uid, &process.name) {
            Ok(()) => changed = true,
            Err(err) => eprintln!("auto-restore failed for {}: {err}", rule.app_name),
        }
    }
    changed
}

/// attach_direct with a pre-resolved app display name (saves a process scan).
fn attach_direct_named(
    app: &tauri::AppHandle,
    pid: u32,
    target_uid: &str,
    app_name: &str,
) -> Result<(), String> {
    if !capture_permission_granted() {
        return Err(PERMISSION_REQUIRED.into());
    }
    let state = state_of(app)?;
    let router = &state.audio.router;
    let process_object_id =
        tap::process_object_for_pid(pid).ok_or("App is not producing audio right now")?;
    let target_device_id = find_id_by_uid(target_uid).ok_or("Target device not found")?;
    let target_name = super::devices::list_devices()
        .into_iter()
        .find(|d| d.uid == target_uid)
        .map(|d| d.name)
        .unwrap_or_else(|| "Output".into());

    let (core, created) = get_or_create_core(router, target_uid, &target_name, target_device_id)?;
    let tap = match Tap::create(&[process_object_id], &format!("tavo-{pid}"), true) {
        Ok(tap) => tap,
        Err(err) => {
            if created {
                teardown_and_remove(&router.routes, target_uid);
            }
            return Err(err);
        }
    };
    push_tap(
        router,
        &core,
        created,
        target_uid,
        NewTap {
            pid,
            app_name: app_name.to_string(),
            process_object_id,
            tap,
        },
    )?;
    notify(app, Signal::State);
    Ok(())
}

/// Save the current routing table as a named preset.
pub fn save_preset_from_routes(app: &tauri::AppHandle, name: &str) -> Result<(), String> {
    let state = state_of(app)?;
    let entries = route_entries(app);
    if entries.is_empty() {
        return Err("No active routes to save".into());
    }
    let rows: Vec<(String, String, String, f64)> = entries
        .iter()
        .map(|e| {
            (
                e.app_name.clone(),
                e.target_uid.clone(),
                e.target_name.clone(),
                e.volume as f64,
            )
        })
        .collect();
    {
        let conn = state.db.lock().unwrap();
        crate::db::save_preset(&conn, name, &rows).map_err(|e| e.to_string())?;
    }
    notify(app, Signal::State);
    Ok(())
}

/// Apply a preset: route each rule's app to its target. Requires capture
/// permission (it cannot have been granted without a prior manual route).
/// Partial failures are reported but don't roll back successful routes.
pub fn apply_preset(app: &tauri::AppHandle, preset_id: i64) -> Result<(), String> {
    if !capture_permission_granted() {
        return Err(PERMISSION_REQUIRED.into());
    }
    let state = state_of(app)?;
    let presets = {
        let conn = state.db.lock().unwrap();
        crate::db::list_presets(&conn).map_err(|e| e.to_string())?
    };
    let Some(preset) = presets.into_iter().find(|p| p.id == preset_id) else {
        return Err("Preset not found".into());
    };

    let audible: Vec<tap::AudioProcess> = tap::list_audio_processes()
        .into_iter()
        .filter(|p| p.audible)
        .collect();
    let mut failures: Vec<String> = Vec::new();
    for rule in &preset.rules {
        let Some(process) = audible
            .iter()
            .find(|p| p.name.eq_ignore_ascii_case(&rule.app_name))
        else {
            failures.push(format!("{} is not playing audio", rule.app_name));
            continue;
        };
        if find_id_by_uid(&rule.target_uid).is_none() {
            failures.push(format!("Target for {} is not connected", rule.app_name));
            continue;
        }
        match attach_direct_named(app, process.pid, &rule.target_uid, &process.name) {
            Ok(()) => {
                let _ = set_app_volume(app, process.pid, rule.volume as f32);
            }
            Err(err) => failures.push(format!("{}: {err}", rule.app_name)),
        }
    }
    notify(app, Signal::State);
    if failures.is_empty() {
        Ok(())
    } else {
        Err(format!("Partially applied — {}", failures.join("; ")))
    }
}

fn create_route_core(
    target_uid: &str,
    target_name: &str,
    target_device_id: AudioObjectID,
) -> Result<RouteCoreArc, String> {
    let aggregate_id = create_aggregate(target_uid, target_name)?;
    let core = Arc::new(RouteCore {
        target_uid: target_uid.to_string(),
        target_name: target_name.to_string(),
        target_device_id,
        aggregate_id,
        proc_id: std::sync::OnceLock::new(),
        taps: Mutex::new(Vec::new()),
        tap_count: AtomicUsize::new(0),
        gains: std::array::from_fn(|_| AtomicU32::new(1.0f32.to_bits())),
        measuring_rms: AtomicBool::new(false),
        rms: AtomicU32::new(0),
        in_rms: AtomicU32::new(0),
        in_samples: AtomicU64::new(0),
        probe_layout: std::sync::Mutex::new(String::new()),
        client_ptr: AtomicUsize::new(0),
    });

    let client_ptr = Arc::into_raw(Arc::clone(&core)) as *mut RouteCore;
    core.client_ptr
        .store(client_ptr as usize, Ordering::Release);

    let mut proc_id: AudioDeviceIOProcID = None;
    let status = unsafe {
        AudioDeviceCreateIOProcID(
            aggregate_id,
            Some(route_io_proc),
            client_ptr.cast(),
            std::ptr::NonNull::from(&mut proc_id),
        )
    };
    if status != 0 {
        unsafe { Arc::from_raw(client_ptr) };
        unsafe { AudioHardwareDestroyAggregateDevice(aggregate_id) };
        return Err(format!("IOProc registration failed: HAL error {status}"));
    }
    let start_status = unsafe { AudioDeviceStart(aggregate_id, proc_id) };
    if start_status != 0 {
        unsafe { AudioDeviceDestroyIOProcID(aggregate_id, proc_id) };
        unsafe { Arc::from_raw(client_ptr) };
        unsafe { AudioHardwareDestroyAggregateDevice(aggregate_id) };
        return Err(format!("Aggregate start failed: HAL error {start_status}"));
    }
    let _ = core.proc_id.set(proc_id);
    Ok(core)
}

/// Stop the IOProc, destroy the aggregate, rebalance the client Arc.
fn teardown_and_remove(
    routes: &Mutex<HashMap<String, RouteCoreArc>>,
    target_uid: &str,
) -> Option<RouteCoreArc> {
    let core = routes.lock().unwrap().remove(target_uid)?;
    if let Some(proc_id) = core.proc_id.get() {
        let _ = unsafe { AudioDeviceStop(core.aggregate_id, *proc_id) };
        unsafe { AudioDeviceDestroyIOProcID(core.aggregate_id, *proc_id) };
    }
    // Aggregate must outlive the IOProc teardown; destroy after.
    unsafe { AudioHardwareDestroyAggregateDevice(core.aggregate_id) };
    let ptr = core.client_ptr.load(Ordering::Acquire) as *const RouteCore;
    if !ptr.is_null() {
        // SAFETY: balanced with the Arc::into_raw in create_route_core.
        unsafe { Arc::from_raw(ptr) };
    }
    Some(core)
}

fn create_aggregate(target_uid: &str, target_name: &str) -> Result<AudioObjectID, String> {
    let key = |c: &std::ffi::CStr| CFString::from_str(c.to_str().expect("literal CStr"));

    let uid_value = CFString::from_str(target_uid);
    let drift_value = CFNumber::new_cgfloat(0.0);
    let sub_keys: [&CFString; 2] = [
        &key(kAudioSubDeviceUIDKey),
        &key(kAudioSubDeviceDriftCompensationKey),
    ];
    let sub_values: [&CFType; 2] = [uid_value.as_ref(), drift_value.as_ref()];
    let sub_device = CFDictionary::<CFString, CFType>::from_slices(&sub_keys, &sub_values);
    let sub_device_ref: &CFDictionary = sub_device.as_ref();
    let empty_taps = CFArray::<CFDictionary>::from_objects(&[]);

    let name_value = CFString::from_str(&format!("Tavo Route — {target_name}"));
    let unique_uid = CFString::from_str(&format!(
        "com.tavo.desktop.route.{}.{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0)
    ));
    let main_value = CFString::from_str(target_uid);
    let sub_refs: [&CFDictionary; 1] = [sub_device_ref];
    let sub_list = CFArray::<CFDictionary>::from_objects(&sub_refs);
    let private_value = CFBoolean::new(true);
    let autostart_value = CFNumber::new_cgfloat(1.0);

    let k_name = key(kAudioAggregateDeviceNameKey);
    let k_uid = key(kAudioAggregateDeviceUIDKey);
    let k_sub_list = key(kAudioAggregateDeviceSubDeviceListKey);
    let k_main = key(kAudioAggregateDeviceMainSubDeviceKey);
    let k_private = key(kAudioAggregateDeviceIsPrivateKey);
    let k_taps = key(kAudioAggregateDeviceTapListKey);
    let k_autostart = key(kAudioAggregateDeviceTapAutoStartKey);
    let keys: [&CFString; 7] = [
        &k_name,
        &k_uid,
        &k_sub_list,
        &k_main,
        &k_private,
        &k_taps,
        &k_autostart,
    ];
    let values: [&CFType; 7] = [
        name_value.as_ref(),
        unique_uid.as_ref(),
        sub_list.as_ref(),
        main_value.as_ref(),
        private_value.as_ref(),
        empty_taps.as_ref(),
        autostart_value.as_ref(),
    ];
    let dict = CFDictionary::<CFString, CFType>::from_slices(&keys, &values);
    let dict_erased: &CFDictionary = dict.as_ref();

    let mut aggregate_id: AudioObjectID = 0;
    let status = unsafe {
        AudioHardwareCreateAggregateDevice(dict_erased, std::ptr::NonNull::from(&mut aggregate_id))
    };
    if status != 0 {
        return Err(format!("Aggregate creation failed: HAL error {status}"));
    }
    Ok(aggregate_id)
}

/// Turn on drift compensation (resampling to the aggregate clock) for every
/// sub-tap. Without it a tap running at a different sample rate than the
/// output device plays back pitch-shifted ("cartoonish"). Setting the tap
/// list via the property doesn't carry the per-tap flag, so set it on the
/// sub-tap objects the aggregate owns.
fn enable_tap_drift_compensation(aggregate_id: AudioObjectID) {
    use objc2_core_audio::{
        kAudioObjectPropertyClass, kAudioObjectPropertyOwnedObjects, kAudioSubTapClassID,
        kAudioSubTapPropertyDriftCompensation, kAudioSubTapPropertyDriftCompensationQuality,
    };
    let Ok(buf) = hal::get_buffer(
        aggregate_id,
        kAudioObjectPropertyOwnedObjects,
        hal::SCOPE_GLOBAL,
        hal::ELEMENT_MAIN,
    ) else {
        return;
    };
    for chunk in buf.chunks_exact(4) {
        let id = u32::from_ne_bytes([chunk[0], chunk[1], chunk[2], chunk[3]]);
        let class = hal::get::<u32>(
            id,
            kAudioObjectPropertyClass,
            hal::SCOPE_GLOBAL,
            hal::ELEMENT_MAIN,
        );
        if class.ok() != Some(kAudioSubTapClassID) {
            continue;
        }
        let _ = hal::set(
            id,
            kAudioSubTapPropertyDriftCompensation,
            hal::SCOPE_GLOBAL,
            hal::ELEMENT_MAIN,
            &1u32,
        );
        // kAudioSubDeviceDriftCompensationMaxQuality
        let _ = hal::set(
            id,
            kAudioSubTapPropertyDriftCompensationQuality,
            hal::SCOPE_GLOBAL,
            hal::ELEMENT_MAIN,
            &0x7Fu32,
        );
    }
}

/// Restart the aggregate's IO so the IOProc sees the input streams of the
/// current tap list. The HAL fixes an IOProc's stream configuration when IO
/// starts; the aggregate is started with no taps, so without a restart the
/// IOProc keeps getting zero input buffers after a tap is added.
fn restart_io(core: &RouteCore) -> Result<(), String> {
    enable_tap_drift_compensation(core.aggregate_id);
    let Some(proc_id) = core.proc_id.get() else {
        return Ok(());
    };
    let _ = unsafe { AudioDeviceStop(core.aggregate_id, *proc_id) };
    let status = unsafe { AudioDeviceStart(core.aggregate_id, *proc_id) };
    if status != 0 {
        return Err(format!("Aggregate restart failed: HAL error {status}"));
    }
    Ok(())
}

/// Replace the aggregate's tap list with `uuids` (order preserved: tap at
/// position p owns aggregate input channels 2p..2p+1).
fn set_tap_list(aggregate_id: AudioObjectID, uuids: &[&str]) -> Result<(), String> {
    // The TapList *property* takes tap UID strings (the creation-time
    // dictionary key takes dicts; the property silently ignores those).
    let strings: Vec<CFRetained<CFString>> = uuids.iter().map(|u| CFString::from_str(u)).collect();
    let refs: Vec<&CFString> = strings.iter().map(|d| &**d).collect();
    let list = CFArray::<CFString>::from_objects(&refs);
    let list_erased: &CFArray = list.as_ref();
    let list_ref: *const CFArray = list_erased;
    hal::set(
        aggregate_id,
        kAudioAggregateDevicePropertyTapList,
        hal::SCOPE_GLOBAL,
        hal::ELEMENT_MAIN,
        &list_ref,
    )
    .map_err(|e| format!("Tap list update failed: HAL error {e}"))
}

// ---------------------------------------------------------------------------
// Permission probe
// ---------------------------------------------------------------------------

/// Create an UNMUTED probe tap, wait for samples, and return a MUTING tap
/// only if audio actually flowed (permission granted). The probe itself is
/// what triggers the macOS prompt on first use.
async fn probe_and_build_tap(
    core: &RouteCore,
    process_object_id: AudioObjectID,
    pid: u32,
) -> Result<Tap, String> {
    let probe = Tap::create(&[process_object_id], &format!("tavo-probe-{pid}"), false)?;
    // Add the probe to the aggregate so its IOProc starts delivering samples.
    {
        let mut taps = core.taps.lock().unwrap();
        taps.push(TapEntry {
            pid,
            app_name: "probe".into(),
            process_object_id,
            tap: Some(probe),
        });
        let uuids: Vec<&str> = taps
            .iter()
            .map(|t| t.tap.as_ref().expect("probe entry").uuid.as_str())
            .collect();
        if let Err(err) = set_tap_list(core.aggregate_id, &uuids).and_then(|_| restart_io(core)) {
            let entry = taps.pop();
            if let Some(entry) = entry {
                drop(entry.tap);
            }
            return Err(err);
        }
        core.tap_count.store(taps.len(), Ordering::Relaxed);
    }

    core.measuring_rms.store(true, Ordering::Relaxed);
    tokio::time::sleep(Duration::from_millis(600)).await;
    core.measuring_rms.store(false, Ordering::Relaxed);
    let rms = f32::from_bits(core.rms.load(Ordering::Relaxed));

    // Remove + destroy the probe tap (list update first).
    let probe_index = core
        .taps
        .lock()
        .unwrap()
        .iter()
        .position(|t| t.app_name == "probe");
    if let Some(index) = probe_index {
        let mut taps = core.taps.lock().unwrap();
        let mut entry = taps.remove(index);
        let probe_tap = entry.tap.take();
        let uuids: Vec<&str> = taps
            .iter()
            .map(|t| t.tap.as_ref().expect("live entry").uuid.as_str())
            .collect();
        let _ = set_tap_list(core.aggregate_id, &uuids).and_then(|_| restart_io(core));
        core.tap_count.store(taps.len(), Ordering::Relaxed);
        drop(probe_tap);
    }

    if rms <= RMS_THRESHOLD {
        let in_rms = f32::from_bits(core.in_rms.load(Ordering::Relaxed));
        let in_samples = core.in_samples.load(Ordering::Relaxed);
        let layout = core.probe_layout.lock().unwrap().clone();
        CAPTURE_STATE.store(2, Ordering::Relaxed);
        return Err(format!(
            "{PERMISSION_REQUIRED} [probe: out_rms={rms:.6} in_rms={in_rms:.6} in_samples={in_samples} {layout}]"
        ));
    }
    CAPTURE_STATE.store(1, Ordering::Relaxed);

    // Permission confirmed: the real, muting tap.
    Tap::create(&[process_object_id], &format!("tavo-{pid}"), true)
}

// ---------------------------------------------------------------------------
// The real-time IOProc
// ---------------------------------------------------------------------------

unsafe extern "C-unwind" fn route_io_proc(
    _device: AudioObjectID,
    _now: std::ptr::NonNull<AudioTimeStamp>,
    input: std::ptr::NonNull<AudioBufferList>,
    _input_time: std::ptr::NonNull<AudioTimeStamp>,
    output: std::ptr::NonNull<AudioBufferList>,
    _output_time: std::ptr::NonNull<AudioTimeStamp>,
    client_data: *mut std::ffi::c_void,
) -> i32 {
    // SAFETY: client_data is the leaked Arc allocation of RouteCore (alive
    // until teardown).
    let core = unsafe { &*(client_data as *const RouteCore) };
    // SAFETY: CoreAudio hands us valid, properly sized buffer lists.
    let input_buffers = unsafe { audio_buffers(input.as_ref()) };
    let output_buffers = unsafe { audio_buffers(output.as_ref()) };
    bridge(core, input_buffers, output_buffers);
    0
}

/// # Safety
/// `list` must be a valid AudioBufferList with `mNumberBuffers` buffers.
unsafe fn audio_buffers(list: &AudioBufferList) -> &[AudioBuffer] {
    std::slice::from_raw_parts(
        std::ptr::addr_of!(list.mBuffers) as *const AudioBuffer,
        list.mNumberBuffers as usize,
    )
}

struct InputView<'a> {
    bufs: &'a [AudioBuffer],
    interleaved: bool,
    channels: usize,
    samples: usize,
}

impl<'a> InputView<'a> {
    fn new(bufs: &'a [AudioBuffer]) -> Self {
        if bufs.len() == 1 && bufs[0].mNumberChannels > 1 {
            let channels = bufs[0].mNumberChannels as usize;
            let samples = bufs[0].mDataByteSize as usize / 4 / channels.max(1);
            InputView {
                bufs,
                interleaved: true,
                channels,
                samples,
            }
        } else {
            let channels = bufs.len();
            let samples = bufs
                .first()
                .map(|b| b.mDataByteSize as usize / 4)
                .unwrap_or(0);
            InputView {
                bufs,
                interleaved: false,
                channels,
                samples,
            }
        }
    }

    fn get(&self, channel: usize, sample: usize) -> f32 {
        if self.samples == 0 || self.channels == 0 {
            return 0.0;
        }
        let (buffer, index) = if self.interleaved {
            (0, sample * self.channels + channel)
        } else {
            (channel, sample)
        };
        let Some(buf) = self.bufs.get(buffer) else {
            return 0.0;
        };
        let data = buf.mData as *const f32;
        if data.is_null() {
            return 0.0;
        }
        // SAFETY: CoreAudio sized each buffer to mDataByteSize bytes of f32.
        let slice = unsafe { std::slice::from_raw_parts(data, buf.mDataByteSize as usize / 4) };
        slice.get(index).copied().unwrap_or(0.0)
    }
}

fn bridge(core: &RouteCore, input_buffers: &[AudioBuffer], output_buffers: &[AudioBuffer]) {
    let input = InputView::new(input_buffers);
    let tap_count = core.tap_count.load(Ordering::Relaxed).min(MAX_TAPS);
    let measuring = core.measuring_rms.load(Ordering::Relaxed);
    let mut probe_sum_squares = 0f64;
    let mut probe_samples = 0usize;

    // Probe diagnostics: capture the raw INPUT side (tap channels) directly —
    // pre-mix — so we can tell "tap delivers nothing/zeroes" (TCC) apart from
    // "mix reads wrong" (layout bug).
    if measuring {
        let mut first = core.probe_layout.lock().unwrap().is_empty();
        let mut in_sum = 0f64;
        let mut in_count = 0u64;
        let mut in_peak = 0f32;
        let mut layout = format!("in_bufs={}", input_buffers.len());
        for (bi, b) in input_buffers.iter().enumerate() {
            let bytes = b.mDataByteSize;
            layout.push_str(&format!(
                " [#{bi}: ch={} bytes={bytes}{}]",
                b.mNumberChannels,
                if b.mData.is_null() { " NULL" } else { "" }
            ));
            if !b.mData.is_null() && bytes > 0 {
                first = false;
                // SAFETY: CoreAudio sized the buffer to mDataByteSize of f32.
                let slice = unsafe {
                    std::slice::from_raw_parts(b.mData as *const f32, bytes as usize / 4)
                };
                for s in slice {
                    let v = *s as f64;
                    in_sum += v * v;
                    in_count += 1;
                    in_peak = in_peak.max(*s);
                }
            }
        }
        let _ = first;
        if in_count > 0 {
            let rms = (in_sum / in_count as f64).sqrt() as f32;
            core.in_rms.store(rms.to_bits(), Ordering::Relaxed);
            core.in_samples.store(in_count, Ordering::Relaxed);
        }
        {
            let mut stored = core.probe_layout.lock().unwrap();
            if stored.is_empty() {
                *stored = layout;
            }
        }
        let _ = in_peak;
    }

    for (buffer_index, out) in output_buffers.iter().enumerate() {
        if out.mData.is_null() || out.mDataByteSize == 0 {
            continue;
        }
        // SAFETY: CoreAudio sized the buffer to mDataByteSize bytes of f32.
        let samples = unsafe {
            std::slice::from_raw_parts_mut(out.mData as *mut f32, out.mDataByteSize as usize / 4)
        };
        let out_channels = out.mNumberChannels as usize;
        let interleaved_out = out_channels > 1 && output_buffers.len() == 1;

        if tap_count == 0 || input.samples == 0 {
            for sample in samples.iter_mut() {
                *sample = 0.0;
            }
            continue;
        }

        for (i, sample) in samples.iter_mut().enumerate() {
            let mut acc = 0f32;
            for t in 0..tap_count {
                let gain = f32::from_bits(core.gains[t].load(Ordering::Relaxed));
                let global_out_channel = if interleaved_out {
                    i % out_channels.max(1)
                } else {
                    buffer_index
                };
                let in_channel = global_out_channel % TAP_CHANNELS;
                // `i` walks interleaved samples; the input is indexed by frame.
                let frame = if interleaved_out {
                    i / out_channels.max(1)
                } else {
                    i
                };
                acc += input.get(t * TAP_CHANNELS + in_channel, frame) * gain;
            }
            *sample = acc.clamp(-4.0, 4.0);
            if measuring && buffer_index == 0 {
                probe_sum_squares += (*sample as f64) * (*sample as f64);
                probe_samples += 1;
            }
        }
    }

    if measuring && probe_samples > 0 {
        let rms = (probe_sum_squares / probe_samples as f64).sqrt() as f32;
        core.rms.store(rms.to_bits(), Ordering::Relaxed);
    }
}
