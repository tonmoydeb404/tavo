//! Core Audio process taps (macOS 14.2+): capture + redirect another app's
//! audio, plus the audio-process enumeration that feeds the routing UI.
//!
//! Permission model: creating a tap needs the TCC "System Audio Recording"
//! permission. Without it a tap still exists but delivers SILENCE — and a
//! muting tap still MUTES. That's why `route_app` always probes with an
//! UNMUTED tap first (safe: audio keeps playing normally) and only rebuilds
//! the tap as muting once real samples arrive. The probe itself triggers the
//! macOS permission prompt on first use.

use objc2::AllocAnyThread;
use objc2_core_audio::{
    kAudioHardwarePropertyProcessObjectList, kAudioHardwarePropertyTranslatePIDToProcessObject,
    kAudioObjectPropertyName, kAudioProcessPropertyIsRunningOutput, AudioObjectID,
};
use objc2_foundation::{NSArray, NSNumber, NSString};
use serde::Serialize;

use super::hal::{self, ELEMENT_MAIN, SCOPE_GLOBAL};

/// Routing needs the process-tap API, introduced in macOS 14.2. Gated by OS
/// version — probing the symbol via `dlsym(RTLD_DEFAULT)` is unreliable
/// (the tap symbols are invisible to the default-handle search on modern
/// macOS, while direct linkage works fine).
pub fn routing_supported() -> bool {
    static SUPPORTED: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
    *SUPPORTED.get_or_init(|| {
        #[cfg(target_os = "macos")]
        {
            os_version().is_some_and(|(major, minor, _)| (major, minor) >= (14, 2))
        }
        #[cfg(not(target_os = "macos"))]
        false
    })
}

/// (major, minor, patch) from `sysctl kern.osproductversion`.
#[cfg(target_os = "macos")]
fn os_version() -> Option<(u32, u32, u32)> {
    unsafe {
        #[link(name = "System")]
        extern "C" {
            fn sysctlbyname(
                name: *const std::ffi::c_char,
                oldp: *mut std::ffi::c_void,
                oldlenp: *mut usize,
                newp: *mut std::ffi::c_void,
                newlen: usize,
            ) -> i32;
        }
        let name = c"kern.osproductversion";
        let mut size: usize = 0;
        if sysctlbyname(
            name.as_ptr(),
            std::ptr::null_mut(),
            &mut size,
            std::ptr::null_mut(),
            0,
        ) != 0
        {
            return None;
        }
        let mut buf = vec![0u8; size];
        if sysctlbyname(
            name.as_ptr(),
            buf.as_mut_ptr().cast(),
            &mut size,
            std::ptr::null_mut(),
            0,
        ) != 0
        {
            return None;
        }
        let version = std::str::from_utf8(&buf[..size.saturating_sub(1)]).ok()?;
        let mut parts = version.split('.');
        let major = parts.next()?.parse().ok()?;
        let minor = parts.next().and_then(|p| p.parse().ok()).unwrap_or(0);
        let patch = parts.next().and_then(|p| p.parse().ok()).unwrap_or(0);
        Some((major, minor, patch))
    }
}

#[cfg(all(test, target_os = "macos"))]
mod tests {
    #[test]
    fn routing_supported_on_modern_macos() {
        // Runs on the dev machine — macOS 14.2+ assumed for development.
        assert!(super::routing_supported());
    }
}

/// A process that currently has audio endpoints (playback devices opened).
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioProcess {
    pub pid: u32,
    /// CoreAudio process object id (stable while the process lives).
    pub object_id: u32,
    pub name: String,
    /// Outermost `.app` bundle containing the executable (icon lookup).
    pub app_path: Option<String>,
    /// True while the process is actually outputting audio.
    pub audible: bool,
}

/// All processes CoreAudio knows about that can produce audio.
pub fn list_audio_processes() -> Vec<AudioProcess> {
    let Ok(buf) = hal::get_buffer(
        hal::SYSTEM_OBJECT,
        kAudioHardwarePropertyProcessObjectList,
        hal::SCOPE_GLOBAL,
        ELEMENT_MAIN,
    ) else {
        return Vec::new();
    };
    let ids: Vec<AudioObjectID> = buf
        .chunks_exact(4)
        .map(|c| u32::from_ne_bytes([c[0], c[1], c[2], c[3]]))
        .collect();
    let mut processes: Vec<AudioProcess> = ids
        .into_iter()
        .filter_map(|id| {
            let pid =
                hal::get::<u32>(id, kAudioProcessPropertyPID, SCOPE_GLOBAL, ELEMENT_MAIN).ok()?;
            if pid == 0 || pid == std::process::id() {
                return None;
            }
            // Process objects rarely expose a name property; resolve it from
            // the executable path (outermost .app wins, so helpers show the
            // parent app's name).
            let (path_name, app_path) = process_app_info(pid);
            let name = path_name
                .or_else(|| {
                    hal::get_string(id, kAudioObjectPropertyName, SCOPE_GLOBAL, ELEMENT_MAIN).ok()
                })
                .unwrap_or_else(|| format!("Process {pid}"));
            let audible = hal::get::<u32>(
                id,
                kAudioProcessPropertyIsRunningOutput,
                SCOPE_GLOBAL,
                ELEMENT_MAIN,
            )
            .map(|v| v != 0)
            .unwrap_or(false);
            Some(AudioProcess {
                pid,
                object_id: id,
                name,
                app_path,
                audible,
            })
        })
        .collect();
    processes.sort_by(|a, b| {
        b.audible
            .cmp(&a.audible)
            .then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    processes
}

/// Display name and `.app` bundle path for `pid`, from its executable path:
/// the outermost `.app` wins (so helpers show the parent app), else the
/// executable's file name with no bundle.
fn process_app_info(pid: u32) -> (Option<String>, Option<String>) {
    #[link(name = "proc")]
    extern "C" {
        fn proc_pidpath(pid: i32, buffer: *mut std::ffi::c_void, size: u32) -> i32;
    }
    let mut buf = vec![0u8; 4096];
    let len = unsafe { proc_pidpath(pid as i32, buf.as_mut_ptr().cast(), buf.len() as u32) };
    if len <= 0 {
        return (None, None);
    }
    let Ok(path) = std::str::from_utf8(&buf[..len as usize]) else {
        return (None, None);
    };
    if let Some(end) = path.find(".app/").map(|i| i + 4) {
        let bundle = &path[..end];
        let name = bundle
            .rsplit('/')
            .next()
            .and_then(|f| f.strip_suffix(".app"))
            .filter(|n| !n.is_empty())
            .map(str::to_string);
        return (name, Some(bundle.to_string()));
    }
    let name = path
        .rsplit('/')
        .next()
        .filter(|n| !n.is_empty())
        .map(str::to_string);
    (name, None)
}

/// CoreAudio process object id for a Unix pid.
pub fn process_object_for_pid(pid: u32) -> Option<AudioObjectID> {
    let pid = pid as i32;
    hal::get_with_qualifier(
        hal::SYSTEM_OBJECT,
        kAudioHardwarePropertyTranslatePIDToProcessObject,
        SCOPE_GLOBAL,
        ELEMENT_MAIN,
        &pid,
    )
    .ok()
    .filter(|id| *id != 0)
}

// ---------------------------------------------------------------------------
// Tap creation
// ---------------------------------------------------------------------------

/// A live process tap. Destroyed on drop.
pub struct Tap {
    pub id: AudioObjectID,
    /// The UUID the HAL assigned; used in the aggregate tap list.
    pub uuid: String,
}

impl Tap {
    /// Stereo-mixdown tap over `process_object_ids`. The mixdown folds every
    /// channel into two — with per-tap channel count fixed at 2, the router
    /// can map each tap to two aggregate input channels.
    pub fn create(
        process_object_ids: &[u32],
        name: &str,
        mute_original: bool,
    ) -> Result<Tap, String> {
        use objc2_core_audio::{
            AudioHardwareCreateProcessTap, CATapDescription, CATapMuteBehavior,
        };

        let ids = NSArray::from_retained_slice(
            process_object_ids
                .iter()
                .map(|id| NSNumber::new_u32(*id))
                .collect::<Vec<_>>()
                .as_slice(),
        );
        let description = unsafe {
            CATapDescription::initStereoMixdownOfProcesses(CATapDescription::alloc(), &ids)
        };
        unsafe {
            description.setName(&NSString::from_str(name));
            description.setPrivate(true);
            description.setMuteBehavior(if mute_original {
                CATapMuteBehavior::Muted
            } else {
                CATapMuteBehavior::Unmuted
            });
        }

        let mut tap_id: AudioObjectID = 0;
        let status = unsafe { AudioHardwareCreateProcessTap(Some(&description), &mut tap_id) };
        if status != 0 {
            return Err(format!(
                "AudioHardwareCreateProcessTap failed: HAL error {status}"
            ));
        }
        let uuid = hal::get_string(tap_id, kAudioTapPropertyUID, SCOPE_GLOBAL, ELEMENT_MAIN)
            .map_err(|e| {
                unsafe { AudioHardwareDestroyProcessTap(tap_id) };
                format!("tap created but UID read failed: HAL error {e}")
            })?;
        Ok(Tap { id: tap_id, uuid })
    }
}

use objc2_core_audio::{
    kAudioProcessPropertyPID, kAudioTapPropertyUID, AudioHardwareDestroyProcessTap,
};

impl Drop for Tap {
    fn drop(&mut self) {
        unsafe { AudioHardwareDestroyProcessTap(self.id) };
    }
}
