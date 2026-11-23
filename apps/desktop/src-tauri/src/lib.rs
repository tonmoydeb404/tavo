use tauri::{image::Image, menu::MenuEvent, tray::TrayIconBuilder, Emitter, Manager};
#[cfg(target_os = "windows")]
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

mod apps;
mod audio;
mod brand;
mod commands;
mod db;
#[cfg(target_os = "linux")]
mod deep_link;
mod env;
mod migrations;
mod state;
mod tray;

use state::AppState;

pub fn show_window(app: &tauri::AppHandle) {
    // Pure menu-bar app: the window opens while the app stays a background
    // (Accessory) process on macOS — no Dock icon, ever.
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

// checks for a newer build at boot and notifies the frontend; the same
// check runs on demand via the `check_for_update` command (settings).
async fn check_for_update(app: tauri::AppHandle) {
    if let Err(err) = commands::run_update_check(&app).await {
        eprintln!("update check failed: {err}");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            // Windows/Linux deliver deep links by spawning a new instance:
            // forward configured deep-link URLs to the running app instead.
            let deep_link_prefix = format!("{}://", env::deep_link_scheme());
            let urls: Vec<String> = args
                .into_iter()
                .filter(|a| a.starts_with(deep_link_prefix.as_str()))
                .collect();
            if !urls.is_empty() {
                let _ = app.emit(format!("{}://deep-link", brand::SLUG).as_str(), urls);
            }
            crate::show_window(app);
        }))
        .setup(|app| {
            // Register the configured deep-link scheme where the OS needs runtime
            // registration. Linux packaged builds use the bundled desktop entry;
            // Linux dev/AppImage builds register their own handler files.
            // macOS registers schemes via the bundled Info.plist, and the
            // plugin reports UnsupportedPlatform there — never fatal.
            #[cfg(target_os = "windows")]
            if let Err(e) = app.deep_link().register_all() {
                eprintln!("deep-link registration failed: {e}");
            }
            #[cfg(target_os = "linux")]
            crate::deep_link::register_at_startup(app);

            // Menu-bar app: never claim a Dock icon, no matter how we were
            // launched (normal, autostart, or single-instance relay).
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // autostart launches with --hidden: stay in the tray without a
            // window; a normal launch shows the main window immediately
            // (still Dock-less — see the policy above)
            let launch_hidden = std::env::args().any(|arg| arg == "--hidden");
            if !launch_hidden {
                show_window(app.handle());
            }

            let mut app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");

            // keep dev builds isolated from the installed production app's data
            if cfg!(debug_assertions) {
                app_data_dir = app_data_dir.join("dev");
            }

            std::fs::create_dir_all(&app_data_dir).ok();
            std::fs::create_dir_all(app_data_dir.join("logs")).ok();

            let conn = db::open_connection(&app_data_dir).expect("failed to open database");

            app.manage(AppState::new(conn, app_data_dir));

            // Dev builds carry a `Dev` postfix in the title (the tray uses
            // the same name) so they read apart from the installed app.
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_title(&env::display_name());
            }

            let updater_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_for_update(updater_handle).await;
            });

            // not a template: renders full color with the app icon's own background,
            // rather than a floating transparent glyph
            let _tray = TrayIconBuilder::with_id("main_tray")
                .icon(Image::from_bytes(include_bytes!("../icons/32x32.png"))?)
                .icon_as_template(false)
                .tooltip(env::display_name())
                .show_menu_on_left_click(true)
                .on_menu_event(|tray, event: MenuEvent| {
                    tray::handle_menu_event(tray.app_handle(), event.id().as_ref());
                })
                .build(app)?;

            tray::rebuild_menu(app.handle());

            // CoreAudio listeners + the coalescing watcher thread that keeps
            // the tray and frontend in sync with device state.
            audio::watch::start(app.handle().clone());

            // Global shortcuts: mute toggle + device cycling. Hardcoded for
            // v1; configurability lands with the settings work.
            app.global_shortcut()
                .on_shortcut("alt+cmd+m", |app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        audio::devices::toggle_input_mute(app);
                    }
                })?;
            app.global_shortcut()
                .on_shortcut("alt+cmd+arrowup", |app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Err(err) =
                            audio::devices::cycle_default(app, audio::devices::Kind::Input)
                        {
                            eprintln!("input cycle failed: {err}");
                        }
                    }
                })?;
            app.global_shortcut()
                .on_shortcut("alt+cmd+arrowdown", |app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Err(err) =
                            audio::devices::cycle_default(app, audio::devices::Kind::Output)
                        {
                            eprintln!("output cycle failed: {err}");
                        }
                    }
                })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            apps::pick_application,
            apps::app_icon,
            commands::greet,
            commands::get_settings,
            commands::set_setting,
            commands::get_audio_snapshot,
            commands::set_default_device,
            commands::set_input_mute,
            commands::set_default_volume,
            commands::route_app,
            commands::unroute_app,
            commands::set_app_volume,
            commands::stop_all_routing,
            commands::recheck_capture_permission,
            commands::open_audio_permission_settings,
            commands::add_routing_rule,
            commands::delete_routing_rule,
            commands::toggle_routing_rule,
            commands::save_preset,
            commands::delete_preset,
            commands::apply_preset,
            commands::enable_autostart,
            commands::disable_autostart,
            commands::is_autostart_enabled,
            commands::check_for_update,
            commands::install_update,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
