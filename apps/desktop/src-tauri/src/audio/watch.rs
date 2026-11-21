//! CoreAudio property listeners + a coalescing watcher thread.
//!
//! HAL callbacks fire on arbitrary CoreAudio threads, often in bursts (a
//! device plug/unplug touches several properties). Callbacks only push a
//! Signal onto a channel; a dedicated thread drains it with a 250 ms
//! coalescing window and then refreshes everything once: re-register
//! per-device listeners if the default input/output changed, re-apply a
//! user-set mute to a new default mic, emit `tavo://audio-changed` to the
//! frontend, rebuild the tray menu, and swap the tray icon to its dimmed
//! variant while the mic is muted.

use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::sync::OnceLock;
use std::time::Duration;

use objc2_core_audio::{
    kAudioDevicePropertyDeviceIsRunningSomewhere, kAudioDevicePropertyMute,
    kAudioDevicePropertyVolumeScalar, kAudioHardwarePropertyDefaultInputDevice,
    kAudioHardwarePropertyDefaultOutputDevice, kAudioHardwarePropertyDevices,
    kAudioHardwarePropertyProcessObjectList, AudioObjectID, AudioObjectPropertyAddress,
    AudioObjectPropertyListenerProc,
};
use tauri::{image::Image, AppHandle, Emitter, Manager};

use super::devices::{self, Kind};
use super::hal::{self, ELEMENT_MAIN, SCOPE_GLOBAL, SCOPE_INPUT, SCOPE_OUTPUT, SYSTEM_OBJECT};

/// How long to keep absorbing follow-up signals before refreshing.
const COALESCE: Duration = Duration::from_millis(250);
/// How often enabled routing rules are re-checked when nothing else fires.
const RULE_TICK: Duration = Duration::from_secs(2);

/// Wrap a callback fn into the Option-wrapped proc type CoreAudio expects.
fn listener(
    f: unsafe extern "C-unwind" fn(
        AudioObjectID,
        u32,
        std::ptr::NonNull<AudioObjectPropertyAddress>,
        *mut std::ffi::c_void,
    ) -> i32,
) -> AudioObjectPropertyListenerProc {
    Some(f)
}

/// What changed; the watcher recomputes a full snapshot either way, so this
/// only decides whether per-device listeners need re-registration.
#[derive(Debug, Clone, Copy)]
pub enum Signal {
    /// Device plug/unplug (`kAudioHardwarePropertyDevices`).
    Devices,
    /// Default input/output assignment changed.
    Defaults,
    /// Property state changed on a device (mute, volume, in-use).
    State,
}

/// The channel shared by all HAL callbacks. Lives for the whole process in
/// `AudioState`, so raw pointers handed to CoreAudio stay valid.
pub struct Watchers {
    tx: Sender<Signal>,
}

// mpsc::Sender is Sync; the watcher struct is only used to send.
unsafe impl Sync for Watchers {}

/// Storage for the process-wide `Watchers` (set once at startup).
pub struct OnceWatchers(OnceLock<Watchers>);

impl OnceWatchers {
    pub fn new() -> Self {
        OnceWatchers(OnceLock::new())
    }

    /// Send a signal if the watcher is running (no-op before `start`).
    pub fn notify(&self, signal: Signal) {
        if let Some(watchers) = self.0.get() {
            let _ = watchers.tx.send(signal);
        }
    }
}

impl Default for OnceWatchers {
    fn default() -> Self {
        Self::new()
    }
}

// Client data for every listener: the address of the Watchers in AudioState.
// Same pointer for all callbacks so removal is symmetric.
extern "C-unwind" fn on_devices_changed(
    _object: AudioObjectID,
    _count: u32,
    _addresses: std::ptr::NonNull<AudioObjectPropertyAddress>,
    client_data: *mut std::ffi::c_void,
) -> i32 {
    let watchers = unsafe { &*(client_data as *const Watchers) };
    let _ = watchers.tx.send(Signal::Devices);
    0
}

extern "C-unwind" fn on_defaults_changed(
    _object: AudioObjectID,
    _count: u32,
    _addresses: std::ptr::NonNull<AudioObjectPropertyAddress>,
    client_data: *mut std::ffi::c_void,
) -> i32 {
    let watchers = unsafe { &*(client_data as *const Watchers) };
    let _ = watchers.tx.send(Signal::Defaults);
    0
}

extern "C-unwind" fn on_state_changed(
    _object: AudioObjectID,
    _count: u32,
    _addresses: std::ptr::NonNull<AudioObjectPropertyAddress>,
    client_data: *mut std::ffi::c_void,
) -> i32 {
    let watchers = unsafe { &*(client_data as *const Watchers) };
    let _ = watchers.tx.send(Signal::State);
    0
}

/// Register system-level listeners + spawn the watcher thread. Call once
/// from setup, after AppState is managed.
pub fn start(app: AppHandle) {
    let (tx, rx) = mpsc::channel();
    let watchers = Watchers { tx };

    // AppState is managed before this runs (see lib.rs), and nothing ever
    // removes it, so the OnceLock value's address is stable.
    let state = app.state::<crate::state::AppState>();
    if state.audio.watchers.0.set(watchers).is_err() {
        return; // already started
    }
    let stored = state.audio.watchers.0.get().expect("just set");
    let stored_data = stored as *const Watchers as *mut std::ffi::c_void;

    let _ = hal::add_listener(
        SYSTEM_OBJECT,
        kAudioHardwarePropertyDevices,
        SCOPE_GLOBAL,
        ELEMENT_MAIN,
        listener(on_devices_changed),
        stored_data,
    );
    let _ = hal::add_listener(
        SYSTEM_OBJECT,
        kAudioHardwarePropertyDefaultInputDevice,
        SCOPE_GLOBAL,
        ELEMENT_MAIN,
        listener(on_defaults_changed),
        stored_data,
    );
    let _ = hal::add_listener(
        SYSTEM_OBJECT,
        kAudioHardwarePropertyDefaultOutputDevice,
        SCOPE_GLOBAL,
        ELEMENT_MAIN,
        listener(on_defaults_changed),
        stored_data,
    );
    // Audio process list (apps producing audio) drives the routing view.
    let _ = hal::add_listener(
        SYSTEM_OBJECT,
        kAudioHardwarePropertyProcessObjectList,
        SCOPE_GLOBAL,
        ELEMENT_MAIN,
        listener(on_devices_changed),
        stored_data,
    );

    // Kick off an initial refresh so the tray + UI populate without waiting
    // for a hardware event.
    let initial_tx = stored.tx.clone();
    let _ = initial_tx.send(Signal::Devices);
    let _ = initial_tx.send(Signal::Defaults);
    let _ = initial_tx.send(Signal::State);

    let client_data_usize = stored_data as usize;
    std::thread::Builder::new()
        .name("tavo-audio-watch".into())
        .spawn(move || watcher_loop(app, rx, client_data_usize))
        .expect("failed to spawn audio watcher thread");
}

#[allow(clippy::needless_pass_by_value)]
fn watcher_loop(app: AppHandle, rx: Receiver<Signal>, client_data: usize) {
    let mut watched_input: Option<AudioObjectID> = None;
    let mut watched_output: Option<AudioObjectID> = None;

    loop {
        // Block until something happens, then keep absorbing for COALESCE.
        // Whether an app is *playing* flips with no HAL notification we
        // subscribe to, so a periodic tick lets auto-route rules catch an
        // app the moment it starts making sound.
        match rx.recv_timeout(RULE_TICK) {
            Ok(signal) => handle_signal(
                &app,
                signal,
                &mut watched_input,
                &mut watched_output,
                client_data,
            ),
            Err(RecvTimeoutError::Timeout) => {
                if super::router::auto_restore(&app) {
                    refresh(&app);
                }
                continue;
            }
            Err(RecvTimeoutError::Disconnected) => return,
        }
        loop {
            match rx.recv_timeout(COALESCE) {
                Ok(signal) => handle_signal(
                    &app,
                    signal,
                    &mut watched_input,
                    &mut watched_output,
                    client_data,
                ),
                Err(RecvTimeoutError::Timeout) => break,
                Err(RecvTimeoutError::Disconnected) => return,
            }
        }
        refresh(&app);
    }
}

// The client data crosses a thread boundary, so it travels as usize and is
// converted back to a raw pointer only at the HAL call sites (the pointee
// lives for the whole process in AudioState).
fn data_ptr(client_data: usize) -> *mut std::ffi::c_void {
    client_data as *mut std::ffi::c_void
}

fn handle_signal(
    app: &AppHandle,
    signal: Signal,
    watched_input: &mut Option<AudioObjectID>,
    watched_output: &mut Option<AudioObjectID>,
    client_data: usize,
) {
    match signal {
        Signal::Devices => {}
        Signal::Defaults => {
            // Re-point per-device listeners at the new default devices, and
            // carry a user-set mute over to the new default mic.
            reregister(watched_input, watched_output, client_data);
            if super::input_mute_applied(app) == Some(true) {
                if let Err(err) = devices::apply_input_mute(app, true) {
                    eprintln!("mute re-apply failed: {err}");
                }
            }
        }
        Signal::State => {}
    }
}

/// Move mute/volume/in-use listeners from the old default devices to the
/// current ones.
fn reregister(
    watched_input: &mut Option<AudioObjectID>,
    watched_output: &mut Option<AudioObjectID>,
    client_data: usize,
) {
    if let Some(old) = *watched_input {
        let _ = hal::remove_listener(
            old,
            kAudioDevicePropertyMute,
            SCOPE_INPUT,
            ELEMENT_MAIN,
            listener(on_state_changed),
            data_ptr(client_data),
        );
        let _ = hal::remove_listener(
            old,
            kAudioDevicePropertyVolumeScalar,
            SCOPE_INPUT,
            ELEMENT_MAIN,
            listener(on_state_changed),
            data_ptr(client_data),
        );
        let _ = hal::remove_listener(
            old,
            kAudioDevicePropertyDeviceIsRunningSomewhere,
            SCOPE_GLOBAL,
            ELEMENT_MAIN,
            listener(on_state_changed),
            data_ptr(client_data),
        );
    }
    if let Some(old) = *watched_output {
        let _ = hal::remove_listener(
            old,
            kAudioDevicePropertyVolumeScalar,
            SCOPE_OUTPUT,
            ELEMENT_MAIN,
            listener(on_state_changed),
            data_ptr(client_data),
        );
    }

    if let Some(id) = devices::default_device_for(Kind::Input) {
        let _ = hal::add_listener(
            id,
            kAudioDevicePropertyMute,
            SCOPE_INPUT,
            ELEMENT_MAIN,
            listener(on_state_changed),
            data_ptr(client_data),
        );
        let _ = hal::add_listener(
            id,
            kAudioDevicePropertyVolumeScalar,
            SCOPE_INPUT,
            ELEMENT_MAIN,
            listener(on_state_changed),
            data_ptr(client_data),
        );
        let _ = hal::add_listener(
            id,
            kAudioDevicePropertyDeviceIsRunningSomewhere,
            SCOPE_GLOBAL,
            ELEMENT_MAIN,
            listener(on_state_changed),
            data_ptr(client_data),
        );
        *watched_input = Some(id);
    } else {
        *watched_input = None;
    }
    if let Some(id) = devices::default_device_for(Kind::Output) {
        let _ = hal::add_listener(
            id,
            kAudioDevicePropertyVolumeScalar,
            SCOPE_OUTPUT,
            ELEMENT_MAIN,
            listener(on_state_changed),
            data_ptr(client_data),
        );
        *watched_output = Some(id);
    } else {
        *watched_output = None;
    }
}

/// Recompute the snapshot, push it to the frontend, and sync the tray.
fn refresh(app: &AppHandle) {
    // Lift routes whose app died / whose target disappeared before exposing
    // state (destroying taps lifts their mutes — clean fallback).
    super::router::sweep_dead(app);
    // Then re-apply enabled routing rules (apps that came back, devices that
    // reconnected). Successes queue refresh signals; the drain loop handles
    // the follow-up pass.
    super::router::auto_restore(app);
    let snapshot = super::snapshot(app);
    let _ = app.emit("tavo://audio-changed", &snapshot);

    if let Some(tray) = app.tray_by_id("main_tray") {
        crate::tray::rebuild_menu(app);
        let muted = snapshot.mic_muted == Some(true);
        let _ = tray.set_icon(Some(if muted { dim_icon() } else { base_icon() }));
    }
}

// ---------------------------------------------------------------------------
// Tray icons (normal + dimmed-for-mute), computed once from the bundled icon
// ---------------------------------------------------------------------------

fn base_icon() -> Image<'static> {
    static ICON: OnceLock<Image<'static>> = OnceLock::new();
    ICON.get_or_init(|| {
        let img = Image::from_bytes(include_bytes!("../../icons/32x32.png"))
            .expect("bundled tray icon must decode");
        Image::new_owned(img.rgba().to_vec(), img.width(), img.height())
    })
    .clone()
}

fn dim_icon() -> Image<'static> {
    static ICON: OnceLock<Image<'static>> = OnceLock::new();
    ICON.get_or_init(|| {
        let img = base_icon();
        let mut rgba = img.rgba().to_vec();
        for pixel in rgba.chunks_exact_mut(4) {
            pixel[0] /= 3;
            pixel[1] /= 3;
            pixel[2] /= 3;
        }
        Image::new_owned(rgba, img.width(), img.height())
    })
    .clone()
}
