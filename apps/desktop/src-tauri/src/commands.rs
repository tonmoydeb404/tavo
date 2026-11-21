use std::collections::HashMap;
use tauri::{AppHandle, Emitter, Manager};

use crate::audio::{self, devices};
use crate::db;
use crate::state::AppState;

fn map_err<E: std::fmt::Display>(e: E) -> String {
    e.to_string()
}

/// Demo IPC command — shows the invoke() round trip from the frontend.
#[tauri::command]
pub fn greet(name: String) -> String {
    format!("Hello, {name}! Welcome to {}.", crate::brand::APP_NAME)
}

// ---- Audio: devices, defaults, mute, volume ----

/// Full audio state; the frontend also receives `tavo://audio-changed` pushes
/// with this exact payload, so this command is only needed for initial load.
#[tauri::command]
pub fn get_audio_snapshot(app: AppHandle) -> audio::AudioSnapshot {
    audio::snapshot(&app)
}

/// Per-app routing (macOS 14.2+): capture `pid`'s audio and redirect it to
/// the device with `target_uid`. First use triggers the macOS System Audio
/// Recording permission prompt.
#[tauri::command]
pub async fn route_app(app: AppHandle, pid: u32, target_uid: String) -> Result<(), String> {
    audio::router::route_app(&app, pid, &target_uid).await
}

#[tauri::command]
pub fn unroute_app(app: AppHandle, pid: u32) -> Result<(), String> {
    audio::router::unroute_app(&app, pid)
}

#[tauri::command]
pub fn set_app_volume(app: AppHandle, pid: u32, volume: f32) -> Result<(), String> {
    let result = audio::router::set_app_volume(&app, pid, volume);
    audio::notify(&app, audio::watch::Signal::State);
    result
}

#[tauri::command]
pub fn stop_all_routing(app: AppHandle) -> Result<(), String> {
    audio::router::stop_all(&app)
}

// ---- Routing rules (auto-restore) + presets ----

#[tauri::command]
pub fn add_routing_rule(
    app: AppHandle,
    app_name: String,
    target_uid: String,
    volume: f64,
) -> Result<(), String> {
    let state = app.state::<AppState>();
    {
        let conn = state.db.lock().map_err(map_err)?;
        crate::db::add_routing_rule(&conn, &app_name, &target_uid, volume).map_err(map_err)?;
    }
    audio::notify(&app, audio::watch::Signal::State);
    Ok(())
}

#[tauri::command]
pub fn delete_routing_rule(app: AppHandle, id: i64) -> Result<(), String> {
    let state = app.state::<AppState>();
    {
        let conn = state.db.lock().map_err(map_err)?;
        crate::db::delete_routing_rule(&conn, id).map_err(map_err)?;
    }
    audio::notify(&app, audio::watch::Signal::State);
    Ok(())
}

#[tauri::command]
pub fn toggle_routing_rule(app: AppHandle, id: i64, enabled: bool) -> Result<(), String> {
    let state = app.state::<AppState>();
    {
        let conn = state.db.lock().map_err(map_err)?;
        crate::db::set_routing_rule_enabled(&conn, id, enabled).map_err(map_err)?;
    }
    audio::notify(&app, audio::watch::Signal::State);
    Ok(())
}

#[tauri::command]
pub fn save_preset(app: AppHandle, name: String) -> Result<(), String> {
    audio::router::save_preset_from_routes(&app, &name)
}

#[tauri::command]
pub fn delete_preset(app: AppHandle, id: i64) -> Result<(), String> {
    let state = app.state::<AppState>();
    {
        let conn = state.db.lock().map_err(map_err)?;
        crate::db::delete_preset(&conn, id).map_err(map_err)?;
    }
    audio::notify(&app, audio::watch::Signal::State);
    Ok(())
}

#[tauri::command]
pub fn apply_preset(app: AppHandle, id: i64) -> Result<(), String> {
    audio::router::apply_preset(&app, id)
}

/// Reset the capture-permission probe state so the next route attempt
/// re-tests (after the user grants in System Settings).
#[tauri::command]
pub fn recheck_capture_permission(app: AppHandle) {
    audio::router::reset_capture_permission();
    // Push a fresh snapshot so the UI drops the "denied" notice immediately.
    audio::notify(&app, audio::watch::Signal::State);
}

/// Open Privacy & Security → System Audio Recording.
#[tauri::command]
pub fn open_audio_permission_settings(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .open_url(
            "x-apple.systempreferences:com.apple.preference.security?Privacy_AudioCapture",
            None::<&str>,
        )
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_default_device(app: AppHandle, uid: String, kind: String) -> Result<(), String> {
    devices::set_default(&app, &uid, parse_device_kind(&kind)?)
}

#[tauri::command]
pub fn set_input_mute(app: AppHandle, muted: bool) -> Result<(), String> {
    devices::apply_input_mute(&app, muted)
}

#[tauri::command]
pub fn set_default_volume(app: AppHandle, kind: String, volume: f32) -> Result<(), String> {
    let kind = parse_device_kind(&kind)?;
    let result = devices::set_default_volume(kind, volume);
    // Volume writes don't always trip the HAL listener (per-channel writes);
    // refresh the UI either way.
    audio::notify(&app, audio::watch::Signal::State);
    result
}

fn parse_device_kind(kind: &str) -> Result<devices::Kind, String> {
    match kind {
        "input" => Ok(devices::Kind::Input),
        "output" => Ok(devices::Kind::Output),
        "system" => Ok(devices::Kind::System),
        other => Err(format!("Unknown device kind: {other}")),
    }
}

// ---- Settings (SQLite key-value store) ----

#[tauri::command]
pub async fn get_settings(app: AppHandle) -> Result<HashMap<String, String>, String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::get_all_settings(&conn)
        .map(|v| v.into_iter().collect())
        .map_err(map_err)
}

#[tauri::command]
pub async fn set_setting(app: AppHandle, key: String, value: String) -> Result<(), String> {
    let state = app.state::<AppState>();
    let conn = state.db.lock().map_err(map_err)?;
    db::set_setting(&conn, &key, &value).map_err(map_err)
}

// ---- Auto-start ----

#[tauri::command]
pub async fn enable_autostart(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().enable().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn disable_autostart(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().disable().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn is_autostart_enabled(app: AppHandle) -> Result<bool, String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}

// ---- Updater ----

#[derive(Debug, serde::Serialize)]
pub struct UpdateInfo {
    pub version: String,
    pub body: Option<String>,
    pub date: Option<String>,
}

/// Checks the updater endpoint. Emits `update://available` when a newer
/// version exists (listeners stay in sync) and returns it to the caller —
/// `None` when up to date. Shared by the boot check and the manual
/// `check_for_update` command.
pub async fn run_update_check(app: &AppHandle) -> Result<Option<UpdateInfo>, String> {
    use tauri_plugin_updater::UpdaterExt;

    let updater = app.updater().map_err(map_err)?;
    match updater.check().await.map_err(map_err)? {
        Some(update) => {
            let info = UpdateInfo {
                version: update.version.clone(),
                body: update.body.clone(),
                date: update.date.map(|d| d.to_string()),
            };
            let _ = app.emit("update://available", &info);
            Ok(Some(info))
        }
        None => Ok(None),
    }
}

/// Manual "Check for updates" (settings screen).
#[tauri::command]
pub async fn check_for_update(app: AppHandle) -> Result<Option<UpdateInfo>, String> {
    run_update_check(&app).await
}

#[tauri::command]
pub async fn install_update(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_updater::UpdaterExt;

    let updater = app.updater().map_err(map_err)?;
    match updater.check().await.map_err(map_err)? {
        Some(update) => {
            update
                .download_and_install(|_, _| {}, || {})
                .await
                .map_err(map_err)?;
            // On macOS/Linux: restart to apply the update.
            // On Windows: the process exits during install, so this is unreachable.
            app.request_restart();
        }
        None => return Err("No update available".into()),
    }
    Ok(())
}
