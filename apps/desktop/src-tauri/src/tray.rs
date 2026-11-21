//! The tray (menu bar) menu — the product's primary surface. Rebuilt from a
//! fresh audio snapshot whenever CoreAudio state changes or the user acts
//! (see audio::watch). Menu item ids:
//!   dev-in:<uid>   select default input
//!   dev-out:<uid>  select default output
//!   toggle-mute    toggle default-input mute
//!   open / quit

use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem},
    AppHandle,
};

use crate::audio::{self, devices};
use crate::brand;

pub fn rebuild_menu(app: &AppHandle) {
    let snapshot = audio::snapshot(app);
    let menu = match Menu::new(app) {
        Ok(menu) => menu,
        Err(_) => return,
    };

    // -- Microphone section -------------------------------------------------
    let input_name = snapshot
        .input_uid
        .as_ref()
        .and_then(|uid| {
            snapshot
                .devices
                .iter()
                .find(|d| &d.uid == uid)
                .map(|d| d.name.clone())
        })
        .unwrap_or_else(|| "No input device".into());

    if append_disabled(app, &menu, &format!("Microphone — {input_name}")).is_none() {
        return;
    }
    for device in snapshot.devices.iter().filter(|d| d.is_input) {
        let checked = snapshot.input_uid.as_deref() == Some(device.uid.as_str());
        append_check(
            app,
            &menu,
            &format!("dev-in:{}", device.uid),
            &device.name,
            checked,
        );
    }
    append_check(
        app,
        &menu,
        "toggle-mute",
        "Mute Microphone",
        snapshot.mic_muted == Some(true),
    );

    if let Some(sep) = separator(app) {
        let _ = menu.append(&sep);
    }

    // -- Output section -----------------------------------------------------
    let output_name = snapshot
        .output_uid
        .as_ref()
        .and_then(|uid| {
            snapshot
                .devices
                .iter()
                .find(|d| &d.uid == uid)
                .map(|d| d.name.clone())
        })
        .unwrap_or_else(|| "No output device".into());

    if append_disabled(app, &menu, &format!("Output — {output_name}")).is_none() {
        return;
    }
    for device in snapshot.devices.iter().filter(|d| d.is_output) {
        let checked = snapshot.output_uid.as_deref() == Some(device.uid.as_str());
        append_check(
            app,
            &menu,
            &format!("dev-out:{}", device.uid),
            &device.name,
            checked,
        );
    }

    if let Some(sep) = separator(app) {
        let _ = menu.append(&sep);
    }

    // -- Routing section (macOS 14.2+) --------------------------------------
    if snapshot.routing_supported {
        if append_disabled(app, &menu, "Routing").is_none() {
            return;
        }
        for route in &snapshot.routes {
            append_check(
                app,
                &menu,
                &format!("unroute:{}", route.pid),
                &format!(
                    "{} → {}  (click to stop)",
                    route.app_name, route.target_name
                ),
                true,
            );
        }
        if !snapshot.routes.is_empty() {
            if let Ok(item) =
                MenuItem::with_id(app, "stop-routing", "Stop all routing", true, None::<&str>)
            {
                let _ = menu.append(&item);
            }
        }
        // Presets: one-click scenarios.
        for preset in &snapshot.presets {
            if let Ok(item) = MenuItem::with_id(
                app,
                format!("preset:{}", preset.id),
                format!("Apply preset: {}", preset.name),
                true,
                None::<&str>,
            ) {
                let _ = menu.append(&item);
            }
        }
        if let Some(sep) = separator(app) {
            let _ = menu.append(&sep);
        }
    }

    // -- App section ---------------------------------------------------------
    if let Ok(item) = MenuItem::with_id(
        app,
        "open",
        format!("Open {}", brand::APP_NAME),
        true,
        None::<&str>,
    ) {
        let _ = menu.append(&item);
    }
    if let Ok(item) = MenuItem::with_id(
        app,
        "quit",
        format!("Quit {}", brand::APP_NAME),
        true,
        None::<&str>,
    ) {
        let _ = menu.append(&item);
    }

    if let Some(tray) = app.tray_by_id("main_tray") {
        let _ = tray.set_menu(Some(menu));
    }
}

pub fn handle_menu_event(app: &AppHandle, id: &str) {
    if let Some(uid) = id.strip_prefix("dev-in:") {
        if let Err(err) = devices::set_default(app, uid, devices::Kind::Input) {
            eprintln!("tray input switch failed: {err}");
        }
        return;
    }
    if let Some(uid) = id.strip_prefix("dev-out:") {
        if let Err(err) = devices::set_default(app, uid, devices::Kind::Output) {
            eprintln!("tray output switch failed: {err}");
        }
        return;
    }
    if let Some(pid) = id
        .strip_prefix("unroute:")
        .and_then(|p| p.parse::<u32>().ok())
    {
        if let Err(err) = audio::router::unroute_app(app, pid) {
            eprintln!("tray unroute failed: {err}");
        }
        return;
    }
    match id {
        "toggle-mute" => devices::toggle_input_mute(app),
        "stop-routing" => {
            if let Err(err) = audio::router::stop_all(app) {
                eprintln!("stop routing failed: {err}");
            }
            audio::notify(app, audio::watch::Signal::State);
        }
        "open" => crate::show_window(app),
        "quit" => app.exit(0),
        _ => {}
    }
}

// ---------------------------------------------------------------------------
// append helpers (HAL failures must never take down the tray)
// ---------------------------------------------------------------------------

fn append_disabled<R: tauri::Runtime>(
    app: &AppHandle<R>,
    menu: &tauri::menu::Menu<R>,
    text: &str,
) -> Option<()> {
    let item = MenuItem::with_id(app, format!("header:{text}"), text, false, None::<&str>).ok()?;
    menu.append(&item).ok()
}

fn append_check<R: tauri::Runtime>(
    app: &AppHandle<R>,
    menu: &tauri::menu::Menu<R>,
    id: &str,
    text: &str,
    checked: bool,
) {
    if let Ok(item) = CheckMenuItem::with_id(app, id, text, true, checked, None::<&str>) {
        let _ = menu.append(&item);
    }
}

fn separator<R: tauri::Runtime>(app: &AppHandle<R>) -> Option<PredefinedMenuItem<R>> {
    PredefinedMenuItem::separator(app).ok()
}
