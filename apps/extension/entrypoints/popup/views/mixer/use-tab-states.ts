import { useCallback, useEffect, useMemo, useState } from "react"

import type { Browser } from "wxt/browser"

import {
  defaultMediaActivity,
  defaultTabState,
  type BroadcastMessage,
  type MediaActivity,
  type TabState,
  type ToBackgroundMessage,
} from "@/lib/messaging"

type Tab = Browser.tabs.Tab

function isResponse(value: unknown): value is Record<number, TabState> {
  if (typeof value !== "object" || value === null) return false
  for (const v of Object.values(value)) {
    if (
      typeof v !== "object" ||
      v === null ||
      !("volume" in v) ||
      typeof v.volume !== "number" ||
      !("muted" in v) ||
      typeof v.muted !== "boolean" ||
      !("micMuted" in v) ||
      typeof v.micMuted !== "boolean" ||
      !("cameraOff" in v) ||
      typeof v.cameraOff !== "boolean"
    ) {
      return false
    }
  }
  return true
}

function isMediaActivityResponse(
  value: unknown,
): value is Record<number, MediaActivity> {
  if (typeof value !== "object" || value === null) return false
  for (const v of Object.values(value)) {
    if (
      typeof v !== "object" ||
      v === null ||
      !("hasMic" in v) ||
      typeof v.hasMic !== "boolean" ||
      !("hasCamera" in v) ||
      typeof v.hasCamera !== "boolean"
    ) {
      return false
    }
  }
  return true
}

// Manages the tab list + per-tab state for the popup.
function useTabStates() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [states, setStates] = useState<Record<number, TabState>>({})
  const [mediaActivity, setMediaActivity] = useState<
    Record<number, MediaActivity>
  >({})
  const [showAll, setShowAll] = useState(false)

  const queryTabs = useCallback(async (all: boolean): Promise<Tab[]> => {
    const query = all ? {} : { audible: true }
    const list = await browser.tabs.query(query)
    list.sort((a, b) => {
      if ((b.audible ? 1 : 0) !== (a.audible ? 1 : 0)) {
        return (b.audible ? 1 : 0) - (a.audible ? 1 : 0)
      }
      return (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0)
    })
    return list
  }, [])

  // Initial tab list load + refresh whenever `showAll` toggles.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const list = await queryTabs(showAll)
      if (cancelled) return
      setTabs(list)
    })()
    return () => {
      cancelled = true
    }
  }, [queryTabs, showAll])

  // Initial state load (once).
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const message: ToBackgroundMessage = { type: "get-all-states" }
      const result = await browser.runtime.sendMessage(message)
      if (cancelled) return
      if (isResponse(result)) setStates(result)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Initial media-activity load (once).
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const message: ToBackgroundMessage = { type: "get-media-activity" }
      const result = await browser.runtime.sendMessage(message)
      if (cancelled) return
      if (isMediaActivityResponse(result)) setMediaActivity(result)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Keep the tab list fresh while the popup is open.
  useEffect(() => {
    const handler = () => {
      void (async () => {
        const list = await queryTabs(showAll)
        setTabs(list)
      })()
    }
    browser.tabs.onCreated.addListener(handler)
    browser.tabs.onUpdated.addListener(handler)
    browser.tabs.onRemoved.addListener(handler)
    browser.tabs.onReplaced.addListener(handler)
    browser.tabs.onAttached.addListener(handler)
    browser.tabs.onDetached.addListener(handler)
    return () => {
      browser.tabs.onCreated.removeListener(handler)
      browser.tabs.onUpdated.removeListener(handler)
      browser.tabs.onRemoved.removeListener(handler)
      browser.tabs.onReplaced.removeListener(handler)
      browser.tabs.onAttached.removeListener(handler)
      browser.tabs.onDetached.removeListener(handler)
    }
  }, [queryTabs, showAll])

  // Sync with background broadcasts.
  useEffect(() => {
    const listener = (msg: BroadcastMessage) => {
      if (msg?.type === "state-changed") {
        setStates((prev) => {
          const next = { ...prev }
          if (msg.state == null) {
            delete next[msg.tabId]
          } else {
            next[msg.tabId] = msg.state
          }
          return next
        })
        return
      }
      if (msg?.type === "media-activity") {
        setMediaActivity((prev) => {
          const next = { ...prev }
          if (msg.activity == null) {
            delete next[msg.tabId]
          } else {
            next[msg.tabId] = msg.activity
          }
          return next
        })
      }
    }
    browser.runtime.onMessage.addListener(listener)
    return () => browser.runtime.onMessage.removeListener(listener)
  }, [])

  const send = useCallback(async (message: ToBackgroundMessage) => {
    try {
      await browser.runtime.sendMessage(message)
    } catch {
      // Background may be mid-restart; ignore. State will sync on next refresh.
    }
  }, [])

  const setVolume = useCallback(
    (tabId: number, volume: number) => {
      setStates((prev) => ({
        ...prev,
        [tabId]: { ...(prev[tabId] ?? defaultTabState()), volume },
      }))
      void send({ type: "set-volume", tabId, volume })
    },
    [send],
  )

  const setMuted = useCallback(
    (tabId: number, muted: boolean) => {
      setStates((prev) => ({
        ...prev,
        [tabId]: { ...(prev[tabId] ?? defaultTabState()), muted },
      }))
      void send({ type: "set-muted", tabId, muted })
    },
    [send],
  )

  const setMicMuted = useCallback(
    (tabId: number, micMuted: boolean) => {
      setStates((prev) => ({
        ...prev,
        [tabId]: { ...(prev[tabId] ?? defaultTabState()), micMuted },
      }))
      void send({ type: "set-mic-muted", tabId, micMuted })
    },
    [send],
  )

  const setCameraOff = useCallback(
    (tabId: number, cameraOff: boolean) => {
      setStates((prev) => ({
        ...prev,
        [tabId]: { ...(prev[tabId] ?? defaultTabState()), cameraOff },
      }))
      void send({ type: "set-camera-off", tabId, cameraOff })
    },
    [send],
  )

  const reset = useCallback(
    (tabId: number) => {
      setStates((prev) => ({ ...prev, [tabId]: defaultTabState() }))
      void send({ type: "reset", tabId })
    },
    [send],
  )

  // Reload a tab. Used when volume control isn't taking effect because the
  // tab was opened before the extension (or its update) was installed — the
  // MAIN-world prototype patches only land on navigation, so a stale page has
  // no audio graph interception until it reloads.
  const reloadTab = useCallback(async (tabId: number) => {
    try {
      await browser.tabs.reload(tabId)
    } catch {
      // Tab may have been closed or be a restricted URL; ignore.
    }
  }, [])

  const rows = useMemo(
    () =>
      tabs.map((tab) => ({
        tab,
        state: states[tab.id ?? -1] ?? defaultTabState(),
        activity: mediaActivity[tab.id ?? -1] ?? defaultMediaActivity(),
      })),
    [tabs, states, mediaActivity],
  )

  return {
    rows,
    showAll,
    setShowAll,
    setVolume,
    setMuted,
    setMicMuted,
    setCameraOff,
    reset,
    reloadTab,
  }
}

export { useTabStates }
export type { Tab }
