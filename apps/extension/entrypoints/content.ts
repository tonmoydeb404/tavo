import {
  BRIDGE_SOURCE,
  DEFAULT_VOLUME,
  getTabState,
  isBridgeMessage,
  type BridgeMessage,
  type ToBackgroundMessage,
  type ToContentMessage,
} from "@/lib/messaging"

// Isolated-world content script. Owns the `browser.runtime` channel to the
// background service worker and bridges commands into the MAIN-world engine
// (see main.content.ts) via window.postMessage. The AudioContext and gain
// graph live in the MAIN world so prototype patches can intercept media the
// page creates.
//
// The bridge is bidirectional:
//   isolated -> MAIN   (apply-volume / apply-mic-muted / apply-camera-off)
//   MAIN     -> isolated (report-activity: per-frame track counts)
export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  allFrames: true,
  main() {
    // On load, apply any previously-stored state for this tab.
    void (async () => {
      try {
        const tabId = await getOwnTabId()
        if (tabId == null) return
        const state = await getTabState(tabId)
        sendBridgeVolume(state.volume)
        sendBridgeMicMuted(state.micMuted)
        sendBridgeCameraOff(state.cameraOff)
      } catch {
        // Storage / messaging not ready yet; ignore — a future apply-*
        // message will sync us.
      }
    })()

    browser.runtime.onMessage.addListener((message: ToContentMessage) => {
      if (message?.type === "apply-volume") {
        sendBridgeVolume(message.volume)
        return Promise.resolve({ ok: true })
      }
      if (message?.type === "apply-mic-muted") {
        sendBridgeMicMuted(message.micMuted)
        return Promise.resolve({ ok: true })
      }
      if (message?.type === "apply-camera-off") {
        sendBridgeCameraOff(message.cameraOff)
        return Promise.resolve({ ok: true })
      }
      return undefined
    })

    // Forward per-frame activity reports from the MAIN-world engine to the
    // background, which aggregates across frames. Note this listener also
    // receives our own outbound apply-* posts; we only act on report-activity.
    window.addEventListener("message", (event) => {
      const data: unknown = event.data
      if (!isBridgeMessage(data)) return
      if (data.kind !== "report-activity") return
      const message: ToBackgroundMessage = {
        type: "frame-media-activity",
        audio: data.audio,
        video: data.video,
      }
      void browser.runtime.sendMessage(message).catch(() => {
        // Background may be mid-restart; the next report will retry.
      })
    })

    // Some sites only create media in response to a user gesture; nudge the
    // MAIN-world engine when the user first interacts with the page.
    const resumeOnGesture = () => {
      sendBridgeVolume(DEFAULT_VOLUME)
      window.removeEventListener("pointerdown", resumeOnGesture)
      window.removeEventListener("keydown", resumeOnGesture)
    }
    window.addEventListener("pointerdown", resumeOnGesture, { once: false })
    window.addEventListener("keydown", resumeOnGesture, { once: false })
  },
})

function postBridge(msg: BridgeMessage): void {
  window.postMessage(msg, "*")
}

function sendBridgeVolume(volume: number): void {
  postBridge({ source: BRIDGE_SOURCE, kind: "apply-volume", volume })
}

function sendBridgeMicMuted(micMuted: boolean | null): void {
  postBridge({ source: BRIDGE_SOURCE, kind: "apply-mic-muted", micMuted })
}

function sendBridgeCameraOff(cameraOff: boolean | null): void {
  postBridge({ source: BRIDGE_SOURCE, kind: "apply-camera-off", cameraOff })
}

// Returns the tab id of the tab this content script runs in, or null if it
// can't be determined (e.g. the page is being torn down).
async function getOwnTabId(): Promise<number | null> {
  try {
    const tab = await browser.runtime.sendMessage({ type: "get-own-tab-id" })
    if (typeof tab?.id === "number") return tab.id
  } catch {
    return null
  }
  return null
}
