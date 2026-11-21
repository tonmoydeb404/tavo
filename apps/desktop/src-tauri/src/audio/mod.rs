//! Core Audio (HAL) access for device enumeration, default-device switching,
//! and mic mute. No audio capture is performed, so none of this needs a TCC
//! permission prompt — device listing, default switching, and property writes
//! are all unprivileged (verified against switchaudio-osx, Raycast's
//! set-audio-device, and the Rust example in murmur-core).

pub mod devices;
pub mod hal;
pub mod router;
pub mod tap;
pub mod watch;

use std::sync::Mutex;

use serde::Serialize;
use tauri::Manager;

use crate::state::AppState;

/// One input/output device as shown in the tray menu and dashboard.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceInfo {
    /// Stable across reconnects (unlike the raw AudioObjectID).
    pub uid: String,
    pub name: String,
    /// Friendly transport label: Built-in, USB, Bluetooth, AirPlay, Virtual…
    pub transport: String,
    pub is_input: bool,
    pub is_output: bool,
}

/// Full audio state pushed to the frontend on every relevant CoreAudio
/// property change (`tavo://audio-changed`). The tray menu is rebuilt from
/// the same snapshot on the Rust side.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioSnapshot {
    pub devices: Vec<DeviceInfo>,
    pub input_uid: Option<String>,
    pub output_uid: Option<String>,
    /// None = no default input device.
    pub mic_muted: Option<bool>,
    /// Some app is recording from the default input right now.
    pub mic_in_use: bool,
    pub input_volume: Option<f32>,
    pub output_volume: Option<f32>,
    /// Apps that can produce audio (routing view).
    pub processes: Vec<tap::AudioProcess>,
    /// Active per-app routes.
    pub routes: Vec<router::RouteEntry>,
    /// Auto-restore rules (user-created; opt-in by construction).
    pub rules: Vec<RuleEntry>,
    /// Named route presets ("one-click scenarios").
    pub presets: Vec<PresetEntry>,
    /// False below macOS 14.2 (routing UI hidden).
    pub routing_supported: bool,
    /// 0 unknown / 1 granted / 2 denied — drives the permission explainer.
    pub capture_permission: u32,
}

/// A stored auto-restore rule.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuleEntry {
    pub id: i64,
    pub app_name: String,
    pub target_uid: String,
    pub target_name: String,
    pub volume: f32,
    pub enabled: bool,
}

/// A named preset and its stored routes.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PresetEntry {
    pub id: i64,
    pub name: String,
    pub rules: Vec<RuleEntry>,
}

pub fn snapshot(app: &tauri::AppHandle) -> AudioSnapshot {
    let devices = devices::list_devices();
    let input_uid = devices::default_uid(devices::Kind::Input);
    let output_uid = devices::default_uid(devices::Kind::Output);
    let mic_muted = devices::input_mute_state();
    let mic_in_use = devices::mic_in_use();
    let input_volume = devices::default_volume(devices::Kind::Input);
    let output_volume = devices::default_volume(devices::Kind::Output);
    let routes = router::route_entries(app);
    let processes = if routes.is_empty() || routing_ui_relevant(app) {
        tap::list_audio_processes()
    } else {
        Vec::new()
    };
    // Rules + presets (DB), with target names resolved against the CURRENT
    // device list (UIDs are stored; names are cosmetic and may have changed).
    let device_names: std::collections::HashMap<String, String> = devices
        .iter()
        .map(|d| (d.uid.clone(), d.name.clone()))
        .collect();
    let resolve = |uid: &str| {
        device_names
            .get(uid)
            .cloned()
            .unwrap_or_else(|| "Disconnected device".into())
    };
    let (rules, presets) = match app.try_state::<AppState>() {
        Some(state) => {
            let conn = state.db.lock().unwrap();
            let rules = crate::db::list_routing_rules(&conn)
                .map(|rows| {
                    rows.into_iter()
                        .map(|r| RuleEntry {
                            id: r.id,
                            app_name: r.app_name,
                            target_uid: r.target_uid.clone(),
                            target_name: resolve(&r.target_uid),
                            volume: r.volume as f32,
                            enabled: r.enabled,
                        })
                        .collect()
                })
                .unwrap_or_default();
            let presets = crate::db::list_presets(&conn)
                .map(|rows| {
                    rows.into_iter()
                        .map(|p| PresetEntry {
                            id: p.id,
                            name: p.name,
                            rules: p
                                .rules
                                .into_iter()
                                .map(|r| RuleEntry {
                                    id: 0,
                                    app_name: r.app_name,
                                    target_uid: r.target_uid.clone(),
                                    target_name: resolve(&r.target_uid),
                                    volume: r.volume as f32,
                                    enabled: true,
                                })
                                .collect(),
                        })
                        .collect()
                })
                .unwrap_or_default();
            (rules, presets)
        }
        None => (Vec::new(), Vec::new()),
    };
    AudioSnapshot {
        devices,
        input_uid,
        output_uid,
        mic_muted,
        mic_in_use,
        input_volume,
        output_volume,
        processes,
        routes,
        rules,
        presets,
        routing_supported: tap::routing_supported(),
        capture_permission: router::capture_permission_state(),
    }
}

/// Skip the process scan when nothing uses it (saves a CoreAudio walk on
/// every unrelated device change).
fn routing_ui_relevant(app: &tauri::AppHandle) -> bool {
    // Any open routing view polls; cheap enough to just always scan while
    // routing is supported. Revisit if profiling says otherwise.
    let _ = app;
    tap::routing_supported()
}

/// Mute bookkeeping: how the current mute was applied, so un-mute can undo
/// exactly (especially the volume-zero fallback, which must restore the
/// previous volume rather than slam it to 100%).
#[derive(Debug, Clone)]
pub enum MuteUndo {
    /// Master mute property was set — unsetting it restores everything.
    Master,
    /// Mute was set per-channel (unmute re-walks the same ladder).
    Channels,
    /// No mute control anywhere; volume was zeroed (prev value stored).
    VolumeZero(f32),
}

/// Per-app audio state shared by commands, the tray, global shortcuts, and
/// the watcher thread.
pub struct AudioState {
    /// How the current mute (if any) was applied to the default input.
    pub mute_undo: Mutex<Option<MuteUndo>>,
    /// Last mute state WE applied. `Some(true)` re-applies to whatever mic
    /// becomes the new default (device switching does not carry mute over).
    pub applied_mute: Mutex<Option<bool>>,
    /// Per-app routing sessions (target device -> taps).
    pub router: router::Router,
    pub watchers: watch::OnceWatchers,
}

impl AudioState {
    pub fn new() -> Self {
        AudioState {
            mute_undo: Mutex::new(None),
            applied_mute: Mutex::new(None),
            router: router::Router::default(),
            watchers: watch::OnceWatchers::new(),
        }
    }

    /// Notify the watcher thread that something changed; it coalesces bursts,
    /// emits `tavo://audio-changed`, and rebuilds the tray. Safe from any
    /// thread (commands, tray handler, global-shortcut handler).
    pub fn notify(&self, signal: watch::Signal) {
        self.watchers.notify(signal);
    }
}

impl Default for AudioState {
    fn default() -> Self {
        Self::new()
    }
}

/// Convenience for handlers that only have an `AppHandle`.
pub fn with_state<F, T>(app: &tauri::AppHandle, f: F) -> Option<T>
where
    F: FnOnce(&AudioState) -> T,
{
    app.try_state::<AppState>().map(|state| f(&state.audio))
}

/// The last mute state WE applied (`None` = never touched).
pub fn input_mute_applied(app: &tauri::AppHandle) -> Option<bool> {
    with_state(app, |a| *a.applied_mute.lock().unwrap()).flatten()
}

pub fn notify(app: &tauri::AppHandle, signal: watch::Signal) {
    with_state(app, |audio| audio.notify(signal));
}
