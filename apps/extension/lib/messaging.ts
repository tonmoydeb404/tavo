// Type-safe message channel shared by popup, background, and content script.
//
// Messages flow:
//   popup      -> background   (get-state, set-volume, set-muted, set-mic-muted, set-camera-off, get-media-activity)
//   content    -> background   (frame-media-activity: per-frame track counts)
//   background -> content      (apply-volume, apply-mic-muted, apply-camera-off)
//   background -> popup        (state-changed + media-activity broadcasts)
//
// Storage layout (chrome.storage.session, keyed by tabId):
//   "tabState:<tabId>"       -> { volume, muted, micMuted, cameraOff }
//   "mediaActivity:<tabId>"  -> { hasMic, hasCamera }

export type TabState = {
  volume: number // 0..400 (percent). 100 = unity gain.
  muted: boolean
  micMuted: boolean // mic input tracks disabled (track.enabled = false)
  cameraOff: boolean // camera input tracks disabled (track.enabled = false)
}

// Observed (not user-set) per-tab media activity, used to disable the mic /
// camera buttons in the popup when no track of that kind is live.
export type MediaActivity = {
  hasMic: boolean
  hasCamera: boolean
}

// Messages sent TO the background service worker.
export type ToBackgroundMessage =
  | {
      type: "get-all-states"
    }
  | {
      type: "set-volume"
      tabId: number
      volume: number // 0..400
    }
  | {
      type: "set-muted"
      tabId: number
      muted: boolean
    }
  | {
      type: "set-mic-muted"
      tabId: number
      micMuted: boolean
    }
  | {
      type: "set-camera-off"
      tabId: number
      cameraOff: boolean
    }
  | {
      type: "reset"
      tabId: number
    }
  | {
      type: "get-media-activity"
    }
  // Per-frame track counts reported by a tab's content script. Background
  // aggregates across frames (media may live in a child frame) before storing
  // and broadcasting the tab-level MediaActivity.
  | {
      type: "frame-media-activity"
      audio: number
      video: number
    }

// Messages broadcast FROM the background to popup / views.
export type BroadcastMessage =
  | {
      type: "state-changed"
      tabId: number
      state: TabState | null // null = cleared
    }
  | {
      type: "media-activity"
      tabId: number
      activity: MediaActivity | null // null = cleared
    }

// Messages sent from background TO a specific tab's content script.
export type ToContentMessage =
  | {
      type: "apply-volume"
      volume: number // 0..400
    }
  | {
      type: "apply-mic-muted"
      micMuted: boolean
    }
  | {
      type: "apply-camera-off"
      cameraOff: boolean
    }

export type AnyMessage =
  | ToBackgroundMessage
  | BroadcastMessage
  | ToContentMessage

// Bridge messages exchanged between the isolated-world content script and the
// MAIN-world content script via window.postMessage. Tagged with `source` so
// each side can ignore unrelated page traffic on the same window.
export const BRIDGE_SOURCE = "at:bridge"

export type BridgeMessage =
  | {
      source: typeof BRIDGE_SOURCE
      kind: "apply-volume"
      volume: number // 0..400
    }
  | {
      source: typeof BRIDGE_SOURCE
      kind: "apply-mic-muted"
      micMuted: boolean
    }
  | {
      source: typeof BRIDGE_SOURCE
      kind: "apply-camera-off"
      cameraOff: boolean
    }
  // MAIN-world engine -> isolated content: current per-frame track counts.
  | {
      source: typeof BRIDGE_SOURCE
      kind: "report-activity"
      audio: number
      video: number
    }

export function isBridgeMessage(value: unknown): value is BridgeMessage {
  if (
    typeof value !== "object" ||
    value === null ||
    !("source" in value) ||
    !("kind" in value)
  ) {
    return false
  }
  if (value.source !== BRIDGE_SOURCE) return false
  switch (value.kind) {
    case "apply-volume":
      return "volume" in value && typeof value.volume === "number"
    case "apply-mic-muted":
      return "micMuted" in value && typeof value.micMuted === "boolean"
    case "apply-camera-off":
      return "cameraOff" in value && typeof value.cameraOff === "boolean"
    case "report-activity":
      return (
        "audio" in value &&
        "video" in value &&
        typeof value.audio === "number" &&
        typeof value.video === "number"
      )
    default:
      return false
  }
}

export const DEFAULT_VOLUME = 100
export const MAX_VOLUME = 400
export const MIN_VOLUME = 0

// Storage helpers (chrome.storage.session so state survives SW restarts
// but is wiped when the browser closes — matches "session, non-persistent").
const TAB_STATE_PREFIX = "tabState:"

export function tabStateKey(tabId: number): string {
  return `${TAB_STATE_PREFIX}${tabId}`
}

export function defaultTabState(): TabState {
  return { volume: DEFAULT_VOLUME, muted: false, micMuted: false, cameraOff: false }
}

export async function getTabState(tabId: number): Promise<TabState> {
  const result = await browser.storage.session.get(tabStateKey(tabId))
  const stored = result[tabStateKey(tabId)]
  if (isTabState(stored)) return stored
  return defaultTabState()
}

function isTabState(value: unknown): value is TabState {
  return (
    typeof value === "object" &&
    value !== null &&
    "volume" in value &&
    "muted" in value &&
    "micMuted" in value &&
    "cameraOff" in value &&
    typeof value.volume === "number" &&
    typeof value.muted === "boolean" &&
    typeof value.micMuted === "boolean" &&
    typeof value.cameraOff === "boolean"
  )
}

export async function setTabState(
  tabId: number,
  state: TabState
): Promise<void> {
  await browser.storage.session.set({ [tabStateKey(tabId)]: state })
}

export async function clearTabState(tabId: number): Promise<void> {
  await browser.storage.session.remove(tabStateKey(tabId))
}

// Media-activity storage (also session-scoped). Aggregated tab-level activity
// derived from per-frame reports; persisted so the popup's initial load works
// even right after a service-worker restart.
const MEDIA_ACTIVITY_PREFIX = "mediaActivity:"

export function mediaActivityKey(tabId: number): string {
  return `${MEDIA_ACTIVITY_PREFIX}${tabId}`
}

export function defaultMediaActivity(): MediaActivity {
  return { hasMic: false, hasCamera: false }
}

export async function getAllMediaActivity(): Promise<
  Record<number, MediaActivity>
> {
  const all = await browser.storage.session.get(null)
  const result: Record<number, MediaActivity> = {}
  for (const [key, value] of Object.entries(all)) {
    if (!key.startsWith(MEDIA_ACTIVITY_PREFIX)) continue
    if (!isMediaActivity(value)) continue
    const tabId = Number(key.slice(MEDIA_ACTIVITY_PREFIX.length))
    if (Number.isNaN(tabId)) continue
    result[tabId] = value
  }
  return result
}

export async function setMediaActivity(
  tabId: number,
  activity: MediaActivity
): Promise<void> {
  await browser.storage.session.set({ [mediaActivityKey(tabId)]: activity })
}

export async function clearMediaActivity(tabId: number): Promise<void> {
  await browser.storage.session.remove(mediaActivityKey(tabId))
}

function isMediaActivity(value: unknown): value is MediaActivity {
  return (
    typeof value === "object" &&
    value !== null &&
    "hasMic" in value &&
    "hasCamera" in value &&
    typeof value.hasMic === "boolean" &&
    typeof value.hasCamera === "boolean"
  )
}

// Convert a 0..400 percent volume to a GainNode.gain value.
export function volumeToGain(volume: number): number {
  return volume / 100
}
