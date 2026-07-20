import { brand } from "@workspace/brand"

import {
  DEFAULT_VOLUME,
  clearMediaActivity,
  clearTabState,
  getAllMediaActivity,
  getTabState,
  setMediaActivity,
  setTabState,
  type BroadcastMessage,
  type MediaActivity,
  type TabState,
  type ToBackgroundMessage,
} from "@/lib/messaging"

// Background service worker: source of truth for per-tab state.
//
// Storage: chrome.storage.session, keyed per tabId. Survives SW restarts,
// wiped when the browser closes.
//
// Mute is applied via chrome.tabs.update({ muted }), which is browser-native
// and silences ALL audio in the tab (including WebRTC). Volume scaling is
// applied via the content script's Web Audio gain graph and forwarded here.
//
// Media activity (hasMic / hasCamera) is aggregated here from per-frame
// reports (content scripts run in all frames); tab-level booleans are derived
// by OR-ing across frames, persisted, and broadcast to the popup.

// In-memory per-frame counts. Keyed by tabId -> frameId. Lost on SW restart;
// frames re-report on any track change, so this repopulates quickly.
const frameActivity = new Map<
  number,
  Map<number, { audio: number; video: number }>
>()
// Last aggregated activity broadcast per tab — used to dedupe broadcasts.
const lastAggregate = new Map<number, MediaActivity>()

export default defineBackground(() => {
  // Open the changelog page when the extension updates, so users see what's
  // new after each release. Skipped on fresh install and during `wxt dev`
  // (which fires spurious "update" events on every reload).
  browser.runtime.onInstalled.addListener((details) => {
    // `import.meta.env.DEV` is a Vite compile-time constant (replaced at build,
    // dead-code eliminated in production), not a runtime env var — the turbo
    // rule can't tell the two apart.
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    if (import.meta.env.DEV) return
    if (details.reason !== "update") return
    void browser.tabs.create({ url: `${brand.url}/changelog` }).catch(() => {
      // No tab permission for the target URL, or the browser is mid-shutdown.
    })
  })

  // Reflect each tab's number of adjustments (volume/mute, mic, camera) as a
  // per-tab toolbar badge, so users can see (without opening the popup) which
  // specific tabs they left adjusted — e.g. a tab still muted after a call.
  browser.storage.session.onChanged.addListener((changes) => {
    const hasStateChange = Object.keys(changes).some((key) =>
      key.startsWith("tabState:"),
    )
    if (hasStateChange) void refreshBadge()
  })
  void refreshBadge()

  // Apply stored state to a freshly-loaded tab (page reload, navigation).
  // mic/camera are only re-applied when the user previously set a preference
  // (non-null); a tab that never had its mic/camera toggled is left alone so
  // we don't, e.g., force-unmute a mic the page muted on join.
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
    if (changeInfo.status !== "complete") return
    const state = await getTabState(tabId)
    if (state.volume !== DEFAULT_VOLUME) {
      await sendVolumeToTab(tabId, state.volume)
    }
    if (state.micMuted !== null) {
      await sendMicMutedToTab(tabId, state.micMuted)
    }
    if (state.cameraOff !== null) {
      await sendCameraOffToTab(tabId, state.cameraOff)
    }
  })

  // Clean up state when a tab is closed.
  browser.tabs.onRemoved.addListener((tabId) => {
    void clearTabState(tabId)
    void clearMediaActivity(tabId)
    frameActivity.delete(tabId)
    lastAggregate.delete(tabId)
    void broadcast({
      type: "state-changed",
      tabId,
      state: null,
    })
    void broadcast({
      type: "media-activity",
      tabId,
      activity: null,
    })
    // Badge refresh is triggered by the storage.onChanged listener above.
  })

  browser.runtime.onMessage.addListener(
    (message: ToBackgroundMessage | { type: "get-own-tab-id" }, sender) => {
      // Content script asks for its own tab id on load.
      if (message?.type === "get-own-tab-id") {
        return Promise.resolve({ id: sender.tab?.id ?? null })
      }

      switch (message?.type) {
        case "set-volume":
          return handleSetVolume(message.tabId, message.volume).then(() => ({
            ok: true,
          }))
        case "set-muted":
          return handleSetMuted(message.tabId, message.muted).then(() => ({
            ok: true,
          }))
        case "set-mic-muted":
          return handleSetMicMuted(message.tabId, message.micMuted).then(
            () => ({ ok: true }),
          )
        case "set-camera-off":
          return handleSetCameraOff(message.tabId, message.cameraOff).then(
            () => ({ ok: true }),
          )
        case "reset":
          return handleReset(message.tabId).then(() => ({ ok: true }))
        case "get-all-states":
          return handleGetAllStates()
        case "get-media-activity":
          return getAllMediaActivity()
        case "frame-media-activity":
          return handleFrameMediaActivity(
            sender.tab?.id ?? null,
            sender.frameId ?? 0,
            message.audio,
            message.video,
          ).then(() => ({ ok: true }))
      }
      return undefined
    },
  )
})

async function handleSetVolume(tabId: number, volume: number): Promise<void> {
  const clamped = Math.max(0, Math.min(400, Math.round(volume)))
  const prev = await getTabState(tabId)
  const next = { ...prev, volume: clamped }
  await setTabState(tabId, next)
  await sendVolumeToTab(tabId, clamped)
  await broadcast({ type: "state-changed", tabId, state: next })
}

async function handleSetMuted(
  tabId: number,
  muted: boolean,
): Promise<void> {
  try {
    await browser.tabs.update(tabId, { muted })
  } catch {
    // Tab may be gone, or no host permission for its URL. Ignore.
  }
  const prev = await getTabState(tabId)
  const next = { ...prev, muted }
  await setTabState(tabId, next)
  await broadcast({ type: "state-changed", tabId, state: next })
}

async function handleSetMicMuted(
  tabId: number,
  micMuted: boolean | null,
): Promise<void> {
  const prev = await getTabState(tabId)
  const next = { ...prev, micMuted }
  await setTabState(tabId, next)
  await sendMicMutedToTab(tabId, micMuted)
  await broadcast({ type: "state-changed", tabId, state: next })
}

async function handleSetCameraOff(
  tabId: number,
  cameraOff: boolean | null,
): Promise<void> {
  const prev = await getTabState(tabId)
  const next = { ...prev, cameraOff }
  await setTabState(tabId, next)
  await sendCameraOffToTab(tabId, cameraOff)
  await broadcast({ type: "state-changed", tabId, state: next })
}

async function handleReset(tabId: number): Promise<void> {
  try {
    await browser.tabs.update(tabId, { muted: false })
  } catch {
    // ignore
  }
  const next: TabState = {
    volume: DEFAULT_VOLUME,
    muted: false,
    // Clear preferences: the extension goes "hands off" on mic/camera and
    // leaves current tracks exactly as they are.
    micMuted: null,
    cameraOff: null,
  }
  await setTabState(tabId, next)
  await sendVolumeToTab(tabId, next.volume)
  await sendMicMutedToTab(tabId, next.micMuted)
  await sendCameraOffToTab(tabId, next.cameraOff)
  await broadcast({ type: "state-changed", tabId, state: next })
}

async function handleGetAllStates(): Promise<Record<number, TabState>> {
  // List current tabs and read each tab's stored state.
  const tabs = await browser.tabs.query({})
  const entries = await Promise.all(
    tabs.map(async (tab) => {
      if (tab.id == null) return null
      const state = await getTabState(tab.id)
      return [tab.id, state] as const
    }),
  )
  const result: Record<number, TabState> = {}
  for (const entry of entries) {
    if (!entry) continue
    result[entry[0]] = entry[1]
  }
  return result
}

// Aggregate a single frame's report into the tab-level MediaActivity. A tab is
// considered to "have" a mic/camera if ANY of its frames reports a live track
// of that kind. Broadcasts are deduped against the last aggregate so noisy
// frames don't spam the popup.
async function handleFrameMediaActivity(
  tabId: number | null,
  frameId: number,
  audio: number,
  video: number,
): Promise<void> {
  if (tabId == null) return
  let frames = frameActivity.get(tabId)
  if (!frames) {
    frames = new Map()
    frameActivity.set(tabId, frames)
  }
  frames.set(frameId, { audio, video })

  let hasMic = false
  let hasCamera = false
  for (const counts of frames.values()) {
    if (counts.audio > 0) hasMic = true
    if (counts.video > 0) hasCamera = true
  }
  const activity: MediaActivity = { hasMic, hasCamera }
  const prev = lastAggregate.get(tabId)
  if (
    prev &&
    prev.hasMic === activity.hasMic &&
    prev.hasCamera === activity.hasCamera
  ) {
    return
  }
  lastAggregate.set(tabId, activity)
  await setMediaActivity(tabId, activity)
  await broadcast({ type: "media-activity", tabId, activity })
}

async function sendVolumeToTab(tabId: number, volume: number): Promise<void> {
  try {
    await browser.tabs.sendMessage(tabId, { type: "apply-volume", volume })
  } catch {
    // Content script may not be loaded yet (e.g. chrome:// pages, PDF viewer,
    // or the tab hasn't finished loading). The stored value will be applied
    // on next load via tabs.onUpdated.
  }
}

async function sendMicMutedToTab(
  tabId: number,
  micMuted: boolean | null,
): Promise<void> {
  try {
    await browser.tabs.sendMessage(tabId, { type: "apply-mic-muted", micMuted })
  } catch {
    // Content script not loaded yet; stored value applied on next load.
  }
}

async function sendCameraOffToTab(
  tabId: number,
  cameraOff: boolean | null,
): Promise<void> {
  try {
    await browser.tabs.sendMessage(tabId, {
      type: "apply-camera-off",
      cameraOff,
    })
  } catch {
    // Content script not loaded yet; stored value applied on next load.
  }
}

async function broadcast(msg: BroadcastMessage): Promise<void> {
  // Broadcast to any open extension pages (popup). Per-tab sendMessage not
  // needed; popup subscribes via runtime.onMessage.
  try {
    await browser.runtime.sendMessage(msg)
  } catch {
    // No listener (popup closed). Expected and harmless.
  }
}

// Set a per-tab badge reflecting the number of adjustments on THAT tab, so
// users can spot at a glance which tab has volume / mic / camera changes
// without opening the popup:
//   volume changed OR tab muted -> +1
//   mic muted                   -> +1
//   camera off                  -> +1
// Max 3 per tab. Tabs with no changes show no badge. The global default is
// empty so unaffected tabs (including those without per-tab state set yet)
// stay clean. Neutral color (not red) — informational, not an error.
async function refreshBadge(): Promise<void> {
  try {
    // Global default: no badge. Per-tab overrides below take precedence.
    await browser.action.setBadgeText({ text: "" })
    await browser.action.setBadgeBackgroundColor({ color: "#6b7280" })

    const tabs = await browser.tabs.query({})
    await Promise.all(
      tabs.map(async (tab) => {
        if (tab.id == null) return
        const state = await getTabState(tab.id)
        let changes = 0
        if (state.volume !== DEFAULT_VOLUME || state.muted) changes++
        if (state.micMuted) changes++
        if (state.cameraOff) changes++
        // Set the per-tab text unconditionally: empty string clears a previous
        // override when the tab returned to defaults. Skipping would leave the
        // stale badge from before the toggle.
        const text = changes === 0 ? "" : changes > 9 ? "9+" : String(changes)
        try {
          await browser.action.setBadgeText({ tabId: tab.id, text })
        } catch {
          // Some tabs (e.g. devtools, chrome://) reject per-tab badge state.
        }
      }),
    )
  } catch {
    // Badge is best-effort; ignore failures (e.g. restricted contexts).
  }
}
