// Types mirroring the Rust serde output (camelCase via serde rename) from
// src-tauri/src/commands.rs and src-tauri/src/audio/mod.rs.

/** Payload of the `update://available` event / check_for_update command. */
export type UpdateInfo = {
  version: string
  body: string | null
  date: string | null
}

/** One input/output device (tray + dashboard). */
export type AudioDeviceInfo = {
  /** Stable across reconnects (unlike the raw CoreAudio id). */
  uid: string
  name: string
  /** Friendly transport label: Built-in, USB, Bluetooth, AirPlay… */
  transport: string
  isInput: boolean
  isOutput: boolean
}

/** Full audio state pushed on every relevant CoreAudio change. */
export type AudioSnapshot = {
  devices: AudioDeviceInfo[]
  inputUid: string | null
  outputUid: string | null
  /** null = no default input device. */
  micMuted: boolean | null
  /** Some app is recording from the default input right now. */
  micInUse: boolean
  inputVolume: number | null
  outputVolume: number | null
  /** Apps that can produce audio (routing view). */
  processes: AudioProcess[]
  /** Active per-app routes. */
  routes: RouteEntry[]
  /** Auto-restore rules (user-created; opt-in). */
  rules: RuleEntry[]
  /** Named route presets. */
  presets: PresetEntry[]
  /** False below macOS 14.2 — routing UI hidden. */
  routingSupported: boolean
  /** 0 unknown / 1 granted / 2 denied — drives the permission explainer. */
  capturePermission: number
}

/** A stored auto-restore rule. */
export type RuleEntry = {
  id: number
  appName: string
  targetUid: string
  targetName: string
  volume: number
  enabled: boolean
}

/** A named preset and its stored routes. */
export type PresetEntry = {
  id: number
  name: string
  rules: RuleEntry[]
}

/** A process that currently has audio endpoints. */
export type AudioProcess = {
  pid: number
  objectId: number
  name: string
  /** Outermost `.app` bundle path, when the process lives in one. */
  appPath: string | null
  /** True while the process is actually outputting audio. */
  audible: boolean
}

/** An active per-app route. */
export type RouteEntry = {
  pid: number
  appName: string
  targetUid: string
  targetName: string
  volume: number
}

export type DeviceKind = "input" | "output" | "system"

/** An application chosen in the system file panel. */
export type PickedApp = {
  name: string
  path: string
}
