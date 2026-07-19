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
import { getShowAllTabs, setShowAllTabs } from "@/lib/preferences"

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
  const [showAll, setShowAllState] = useState(false)

  // Load persisted "Show all tabs" preference on mount.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const stored = await getShowAllTabs()
      if (cancelled) return
      setShowAllState(stored)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setShowAll = useCallback((value: boolean) => {
    setShowAllState(value)
    void setShowAllTabs(value)
  }, [])
  // False until the first parallel load completes; gates the skeleton.
  const [loaded, setLoaded] = useState(false)
  // Set when a send to the background fails (SW restart, etc.). Auto-clears.
  const [error, setError] = useState<string | null>(null)

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

  // Initial parallel load + refresh whenever `showAll` toggles.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [list, statesResult, activityResult] = await Promise.all([
          queryTabs(showAll),
          browser.runtime.sendMessage({
            type: "get-all-states",
          } satisfies ToBackgroundMessage),
          browser.runtime.sendMessage({
            type: "get-media-activity",
          } satisfies ToBackgroundMessage),
        ])
        if (cancelled) return
        setTabs(list)
        if (isResponse(statesResult)) setStates(statesResult)
        if (isMediaActivityResponse(activityResult)) {
          setMediaActivity(activityResult)
        }
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [queryTabs, showAll])

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

  // Auto-dismiss the error banner after a short delay.
  useEffect(() => {
    if (!error) return
    const timer = window.setTimeout(() => setError(null), 4000)
    return () => window.clearTimeout(timer)
  }, [error])

  const send = useCallback(async (message: ToBackgroundMessage) => {
    try {
      await browser.runtime.sendMessage(message)
      setError(null)
    } catch {
      // Background may be mid-restart; surface to the user and ignore.
      setError(
        "Couldn't reach the audio engine. Changes may not persist after the popup closes.",
      )
    }
  }, [])

  const dismissError = useCallback(() => setError(null), [])

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
    loaded,
    error,
    dismissError,
  }
}

export { useTabStates }
export type { Tab }
