import { invoke } from "@tauri-apps/api/core"
import { listen, type UnlistenFn } from "@tauri-apps/api/event"

import type { AudioSnapshot, DeviceKind, PickedApp, UpdateInfo } from "../types"

// All IPC wrappers live here — one entry per Rust command in
// src-tauri/src/commands.rs.

export const api = {
  // Smoke-test command — proves the invoke() round trip works.
  greet: (name: string) => invoke<string>("greet", { name }),

  getAudioSnapshot: () => invoke<AudioSnapshot>("get_audio_snapshot"),
  setDefaultDevice: (uid: string, kind: DeviceKind) =>
    invoke<void>("set_default_device", { uid, kind }),
  setInputMute: (muted: boolean) => invoke<void>("set_input_mute", { muted }),
  setDefaultVolume: (kind: DeviceKind, volume: number) =>
    invoke<void>("set_default_volume", { kind, volume }),

  /** Sentinel prefix the backend uses for capture-permission failures. */
  routeApp: (pid: number, targetUid: string) =>
    invoke<void>("route_app", { pid, targetUid }),
  unrouteApp: (pid: number) => invoke<void>("unroute_app", { pid }),
  setAppVolume: (pid: number, volume: number) =>
    invoke<void>("set_app_volume", { pid, volume }),
  stopAllRouting: () => invoke<void>("stop_all_routing"),
  recheckCapturePermission: () => invoke<void>("recheck_capture_permission"),
  openAudioPermissionSettings: () =>
    invoke<void>("open_audio_permission_settings"),

  /** System file panel limited to .app bundles; null when cancelled. */
  pickApplication: () => invoke<PickedApp | null>("pick_application"),
  /** PNG data URL of an app's real icon (`.app` path or app name). */
  appIcon: (key: string) => invoke<string | null>("app_icon", { key }),

  addRoutingRule: (appName: string, targetUid: string, volume: number) =>
    invoke<void>("add_routing_rule", { appName, targetUid, volume }),
  deleteRoutingRule: (id: number) =>
    invoke<void>("delete_routing_rule", { id }),
  toggleRoutingRule: (id: number, enabled: boolean) =>
    invoke<void>("toggle_routing_rule", { id, enabled }),
  savePreset: (name: string) => invoke<void>("save_preset", { name }),
  deletePreset: (id: number) => invoke<void>("delete_preset", { id }),
  applyPreset: (id: number) => invoke<void>("apply_preset", { id }),

  getSettings: () => invoke<Record<string, string>>("get_settings"),
  setSetting: (key: string, value: string) =>
    invoke<void>("set_setting", { key, value }),

  enableAutostart: () => invoke<void>("enable_autostart"),
  disableAutostart: () => invoke<void>("disable_autostart"),
  isAutostartEnabled: () => invoke<boolean>("is_autostart_enabled"),

  installUpdate: () => invoke<void>("install_update"),
  /** Manual updater check (settings) — null when up to date. */
  checkForUpdate: () => invoke<UpdateInfo | null>("check_for_update"),
}

// Backend → frontend events (emitted from Rust with app.emit(...)).

export function onAudioChanged(
  callback: (snapshot: AudioSnapshot) => void
): Promise<UnlistenFn> {
  return listen<AudioSnapshot>("tavo://audio-changed", (event) =>
    callback(event.payload)
  )
}

export function onUpdateAvailable(
  callback: (payload: UpdateInfo) => void
): Promise<UnlistenFn> {
  return listen<UpdateInfo>("update://available", (event) =>
    callback(event.payload)
  )
}
