//! High-level device operations: enumeration, default switching, mic mute,
//! volume. Pure CoreAudio, no capture — no TCC permission required.

use objc2_core_audio::{
    kAudioDevicePropertyDeviceIsRunningSomewhere, kAudioDevicePropertyDeviceUID,
    kAudioDevicePropertyMute, kAudioDevicePropertyStreams, kAudioDevicePropertyTransportType,
    kAudioDevicePropertyVolumeScalar, kAudioHardwarePropertyDefaultInputDevice,
    kAudioHardwarePropertyDefaultOutputDevice, kAudioHardwarePropertyDefaultSystemOutputDevice,
    kAudioHardwarePropertyDevices, kAudioObjectPropertyName, AudioObjectID,
    AudioObjectPropertyScope,
};

use super::hal::{self, ELEMENT_MAIN, SCOPE_GLOBAL, SCOPE_INPUT, SCOPE_OUTPUT, SYSTEM_OBJECT};
use super::{input_mute_applied, notify, watch, with_state, DeviceInfo, MuteUndo};

/// Which default slot to read/write.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Kind {
    Input,
    Output,
    /// System-sounds output (alert blips etc.), distinct from the main output.
    System,
}

impl Kind {
    fn selector(self) -> u32 {
        match self {
            Kind::Input => kAudioHardwarePropertyDefaultInputDevice,
            Kind::Output => kAudioHardwarePropertyDefaultOutputDevice,
            Kind::System => kAudioHardwarePropertyDefaultSystemOutputDevice,
        }
    }

    fn scope(self) -> AudioObjectPropertyScope {
        match self {
            Kind::Input => SCOPE_INPUT,
            Kind::Output | Kind::System => SCOPE_OUTPUT,
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Kind::Input => "input",
            Kind::Output => "output",
            Kind::System => "system output",
        }
    }
}

// ---------------------------------------------------------------------------
// Enumeration
// ---------------------------------------------------------------------------

fn transport_label(transport: u32) -> &'static str {
    match transport {
        0x6275_6c74 /* 'bult' */ => "Built-in",
        0x7573_6220 /* 'usb ' */ => "USB",
        0x6274_6d6d /* 'btmm' */ => "Bluetooth",
        0x626c_6575 /* 'bleu' */ => "Bluetooth LE",
        0x6169_7270 /* 'airp' */ => "AirPlay",
        0x7669_7274 /* 'virt' */ => "Virtual",
        0x6470_7274 /* 'dprt' */ => "DisplayPort",
        0x7468_7275 /* 'thru' */ => "Thunderbolt",
        0x6669_7265 /* 'fire' */ => "FireWire",
        _ => "External",
    }
}

fn stream_count(id: AudioObjectID, scope: AudioObjectPropertyScope) -> usize {
    hal::get_buffer(id, kAudioDevicePropertyStreams, scope, ELEMENT_MAIN)
        .map(|buf| buf.len() / std::mem::size_of::<u32>())
        .unwrap_or(0)
}

fn device_info(id: AudioObjectID) -> Option<DeviceInfo> {
    // UID is our stable key; devices without one (rare aggregates) are skipped.
    let uid = hal::get_string(
        id,
        kAudioDevicePropertyDeviceUID,
        SCOPE_GLOBAL,
        ELEMENT_MAIN,
    )
    .ok()?;
    let name = hal::get_string(id, kAudioObjectPropertyName, SCOPE_GLOBAL, ELEMENT_MAIN)
        .unwrap_or_else(|_| "Unknown device".into());
    let transport = transport_label(
        hal::get::<u32>(
            id,
            kAudioDevicePropertyTransportType,
            SCOPE_GLOBAL,
            ELEMENT_MAIN,
        )
        .unwrap_or(0),
    );
    let is_input = stream_count(id, SCOPE_INPUT) > 0;
    let is_output = stream_count(id, SCOPE_OUTPUT) > 0;
    Some(DeviceInfo {
        uid,
        name,
        transport: transport.to_string(),
        is_input,
        is_output,
    })
}

/// All connected devices with at least one input or output stream.
pub fn list_devices() -> Vec<DeviceInfo> {
    let Ok(buf) = hal::get_buffer(
        SYSTEM_OBJECT,
        kAudioHardwarePropertyDevices,
        SCOPE_GLOBAL,
        ELEMENT_MAIN,
    ) else {
        return Vec::new();
    };
    let ids: Vec<AudioObjectID> = buf
        .chunks_exact(4)
        .map(|c| u32::from_ne_bytes([c[0], c[1], c[2], c[3]]))
        .collect();
    let mut devices: Vec<DeviceInfo> = ids.into_iter().filter_map(device_info).collect();
    devices.retain(|d| d.is_input || d.is_output);
    devices.sort_by_key(|d| d.name.to_lowercase());
    devices
}

// ---------------------------------------------------------------------------
// Default device
// ---------------------------------------------------------------------------

fn default_device_id(kind: Kind) -> Option<AudioObjectID> {
    hal::get(SYSTEM_OBJECT, kind.selector(), SCOPE_GLOBAL, ELEMENT_MAIN)
        .ok()
        .filter(|id| *id != 0)
}

/// Raw id of the current default device (watcher listener registration).
pub fn default_device_for(kind: Kind) -> Option<AudioObjectID> {
    default_device_id(kind)
}

pub fn default_uid(kind: Kind) -> Option<String> {
    default_device_id(kind).and_then(|id| {
        hal::get_string(
            id,
            kAudioDevicePropertyDeviceUID,
            SCOPE_GLOBAL,
            ELEMENT_MAIN,
        )
        .ok()
    })
}

/// Resolve a device UID to its raw id (router target lookup).
pub(crate) fn find_id_by_uid(uid: &str) -> Option<AudioObjectID> {
    let buf = hal::get_buffer(
        SYSTEM_OBJECT,
        kAudioHardwarePropertyDevices,
        SCOPE_GLOBAL,
        ELEMENT_MAIN,
    )
    .ok()?;
    buf.chunks_exact(4)
        .map(|c| u32::from_ne_bytes([c[0], c[1], c[2], c[3]]))
        .find(|id| {
            hal::get_string(
                *id,
                kAudioDevicePropertyDeviceUID,
                SCOPE_GLOBAL,
                ELEMENT_MAIN,
            )
            .is_ok_and(|candidate| candidate == uid)
        })
}

/// Switch the default device. Input switches get the "nudge" re-set that
/// pushes macOS into establishing the Bluetooth HFP/SCO link (proven in
/// murmur-core) — without it, AirPods can stay in A2DP with no mic.
pub fn set_default(app: &tauri::AppHandle, uid: &str, kind: Kind) -> Result<(), String> {
    let id = find_id_by_uid(uid).ok_or_else(|| format!("Device not found: {uid}"))?;
    hal::set(
        SYSTEM_OBJECT,
        kind.selector(),
        SCOPE_GLOBAL,
        ELEMENT_MAIN,
        &id,
    )
    .map_err(|e| format!("Failed to set {} device: HAL error {e}", kind.label()))?;
    if kind == Kind::Input {
        // Nudge: writing the same value again reliably establishes the SCO
        // link on Bluetooth headsets.
        let _ = hal::set(
            SYSTEM_OBJECT,
            kind.selector(),
            SCOPE_GLOBAL,
            ELEMENT_MAIN,
            &id,
        );
        // A mute the user left on stays muted on the new mic.
        if input_mute_applied(app) == Some(true) {
            let _ = apply_input_mute(app, true);
        }
    }
    notify(app, watch::Signal::Defaults);
    Ok(())
}

/// Switch to the next device of `kind` (sorted by name, wrapping around).
pub fn cycle_default(app: &tauri::AppHandle, kind: Kind) -> Result<(), String> {
    let devices: Vec<DeviceInfo> = list_devices()
        .into_iter()
        .filter(|d| match kind {
            Kind::Input => d.is_input,
            Kind::Output | Kind::System => d.is_output,
        })
        .collect();
    let Some(current) = default_uid(kind) else {
        return Err(format!("No {} device", kind.label()));
    };
    let next = match devices.iter().position(|d| d.uid == current) {
        Some(i) => &devices[(i + 1) % devices.len()],
        None => devices
            .first()
            .ok_or_else(|| format!("No {} device", kind.label()))?,
    };
    set_default(app, &next.uid, kind)
}

// ---------------------------------------------------------------------------
// Mic mute
// ---------------------------------------------------------------------------

/// Best-effort read of the default input's mute state: master mute first,
/// then channel 1, then "volume is zero".
pub fn input_mute_state() -> Option<bool> {
    let id = default_device_id(Kind::Input)?;
    if let Ok(m) = hal::get::<u32>(id, kAudioDevicePropertyMute, SCOPE_INPUT, ELEMENT_MAIN) {
        return Some(m != 0);
    }
    if let Ok(m) = hal::get::<u32>(id, kAudioDevicePropertyMute, SCOPE_INPUT, 1) {
        return Some(m != 0);
    }
    default_volume(Kind::Input).map(|v| v <= 0.005)
}

/// Some app is capturing from the default input right now
/// (`kAudioDevicePropertyDeviceIsRunningSomewhere`).
pub fn mic_in_use() -> bool {
    default_device_id(Kind::Input)
        .and_then(|id| {
            hal::get::<u32>(
                id,
                kAudioDevicePropertyDeviceIsRunningSomewhere,
                SCOPE_GLOBAL,
                ELEMENT_MAIN,
            )
            .ok()
        })
        .is_some_and(|v| v != 0)
}

/// Walk the mute ladder on the default input: master mute, then per-channel
/// mutes, then volume-zero (recording the previous volume so un-mute
/// restores it instead of jumping to 100%).
pub fn apply_input_mute(app: &tauri::AppHandle, muted: bool) -> Result<(), String> {
    let Some(id) = default_device_id(Kind::Input) else {
        return Err("No input device".into());
    };

    // 1. Master mute — the clean path on most devices.
    if hal::is_settable(id, kAudioDevicePropertyMute, SCOPE_INPUT, ELEMENT_MAIN) {
        hal::set(
            id,
            kAudioDevicePropertyMute,
            SCOPE_INPUT,
            ELEMENT_MAIN,
            &(muted as u32),
        )
        .map_err(|e| format!("HAL error {e}"))?;
        with_state(app, |a| {
            *a.mute_undo.lock().unwrap() = if muted { Some(MuteUndo::Master) } else { None };
        });
        return finish_mute(app, muted);
    }

    // 2. Per-channel mutes.
    let mut channels = Vec::new();
    for element in 1u32..=32 {
        if hal::is_settable(id, kAudioDevicePropertyMute, SCOPE_INPUT, element)
            && hal::set(
                id,
                kAudioDevicePropertyMute,
                SCOPE_INPUT,
                element,
                &(muted as u32),
            )
            .is_ok()
        {
            channels.push(element);
        }
    }
    if !channels.is_empty() {
        with_state(app, |a| {
            let _ = channels;
            *a.mute_undo.lock().unwrap() = if muted {
                Some(MuteUndo::Channels)
            } else {
                None
            };
        });
        return finish_mute(app, muted);
    }

    // 3. Volume-zero fallback (record mics without any mute control).
    let elements = settable_volume_elements(id, kind_scope(Kind::Input));
    if elements.is_empty() {
        return Err("Input device has no mute or volume control".into());
    }
    if muted {
        let prev = default_volume(Kind::Input).unwrap_or(0.5);
        set_volume_on_elements(id, &elements, 0.0);
        with_state(app, |a| {
            *a.mute_undo.lock().unwrap() = Some(MuteUndo::VolumeZero(prev));
        });
    } else {
        let restore = with_state(app, |a| match *a.mute_undo.lock().unwrap() {
            Some(MuteUndo::VolumeZero(prev)) => prev,
            _ => 0.5,
        })
        .unwrap_or(0.5);
        set_volume_on_elements(id, &elements, restore);
        with_state(app, |a| *a.mute_undo.lock().unwrap() = None);
    }
    finish_mute(app, muted)
}

/// Toggle the current default input's mute (tray item + global shortcut).
pub fn toggle_input_mute(app: &tauri::AppHandle) {
    let current = input_mute_applied(app)
        .or(input_mute_state())
        .unwrap_or(false);
    if let Err(err) = apply_input_mute(app, !current) {
        eprintln!("mic mute toggle failed: {err}");
    }
}

fn finish_mute(app: &tauri::AppHandle, muted: bool) -> Result<(), String> {
    with_state(app, |a| *a.applied_mute.lock().unwrap() = Some(muted));
    notify(app, watch::Signal::State);
    Ok(())
}

// ---------------------------------------------------------------------------
// Volume
// ---------------------------------------------------------------------------

fn kind_scope(kind: Kind) -> AudioObjectPropertyScope {
    kind.scope()
}

/// Elements (0 = master, then channels) with a settable volume in `scope`.
fn settable_volume_elements(id: AudioObjectID, scope: AudioObjectPropertyScope) -> Vec<u32> {
    let mut elements = Vec::new();
    if hal::is_settable(id, kAudioDevicePropertyVolumeScalar, scope, ELEMENT_MAIN) {
        elements.push(ELEMENT_MAIN);
    }
    for element in 1u32..=32 {
        if hal::is_settable(id, kAudioDevicePropertyVolumeScalar, scope, element) {
            elements.push(element);
        }
    }
    elements
}

fn set_volume_on_elements(id: AudioObjectID, elements: &[u32], value: f32) {
    for &element in elements {
        let _ = hal::set(
            id,
            kAudioDevicePropertyVolumeScalar,
            SCOPE_GLOBAL,
            element,
            &value,
        )
        .or_else(|_| {
            hal::set(
                id,
                kAudioDevicePropertyVolumeScalar,
                SCOPE_OUTPUT,
                element,
                &value,
            )
        })
        .or_else(|_| {
            hal::set(
                id,
                kAudioDevicePropertyVolumeScalar,
                SCOPE_INPUT,
                element,
                &value,
            )
        });
    }
}

/// Default device volume in 0.0..=1.0 (master control or channel 1).
pub fn default_volume(kind: Kind) -> Option<f32> {
    let id = default_device_id(kind)?;
    let scope = kind.scope();
    if let Ok(v) = hal::get::<f32>(id, kAudioDevicePropertyVolumeScalar, scope, ELEMENT_MAIN) {
        return Some(v.clamp(0.0, 1.0));
    }
    hal::get::<f32>(id, kAudioDevicePropertyVolumeScalar, scope, 1)
        .ok()
        .map(|v| v.clamp(0.0, 1.0))
}

/// Set default device volume (dashboard sliders).
pub fn set_default_volume(kind: Kind, volume: f32) -> Result<(), String> {
    let Some(id) = default_device_id(kind) else {
        return Err(format!("No {} device", kind.label()));
    };
    let value = volume.clamp(0.0, 1.0);
    let scope = kind.scope();
    if hal::is_settable(id, kAudioDevicePropertyVolumeScalar, scope, ELEMENT_MAIN) {
        return hal::set(
            id,
            kAudioDevicePropertyVolumeScalar,
            scope,
            ELEMENT_MAIN,
            &value,
        )
        .map_err(|e| format!("HAL error {e}"));
    }
    let mut wrote = false;
    for element in 1u32..=32 {
        if hal::is_settable(id, kAudioDevicePropertyVolumeScalar, scope, element)
            && hal::set(id, kAudioDevicePropertyVolumeScalar, scope, element, &value).is_ok()
        {
            wrote = true;
        }
    }
    if wrote {
        Ok(())
    } else {
        Err(format!("{} device has no volume control", kind.label()))
    }
}
