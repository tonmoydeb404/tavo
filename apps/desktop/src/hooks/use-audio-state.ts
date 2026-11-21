import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { api, onAudioChanged } from "@/lib/api"
import type { AudioSnapshot, DeviceKind } from "@/types"

// Owns the audio snapshot lifecycle: initial fetch, live updates from the
// Rust watcher (`tavo://audio-changed`), and the user actions. Actions are
// optimistic where cheap (mute, device switch); the backend pushes the
// authoritative snapshot right after, which reconciles any drift.

const VOLUME_DEBOUNCE_MS = 140

function useAudioState() {
  const [snapshot, setSnapshot] = useState<AudioSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // Tracks recent local edits so a stale pushed snapshot doesn't fight the
  // volume sliders mid-drag.
  const lastLocalEditRef = useRef(0)

  useEffect(() => {
    let mounted = true
    api
      .getAudioSnapshot()
      .then((snapshot) => {
        if (mounted) setSnapshot(snapshot)
      })
      .catch((err: unknown) => {
        if (mounted) setError(String(err))
      })
    const unlisten = onAudioChanged((next) => {
      if (!mounted) return
      // Don't clobber a slider the user is actively moving.
      if (Date.now() - lastLocalEditRef.current < VOLUME_DEBOUNCE_MS + 250) {
        return
      }
      setSnapshot(next)
    })
    return () => {
      mounted = false
      void unlisten.then((fn) => fn())
    }
  }, [])

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err: unknown) {
      setError(String(err))
    } finally {
      setBusy(false)
    }
  }, [])

  const setDefaultDevice = useCallback(
    (uid: string, kind: DeviceKind) => {
      lastLocalEditRef.current = Date.now()
      // Optimistic: flip the default locally so the UI feels instant; the
      // pushed snapshot reconciles (and re-sorts) right after.
      setSnapshot((prev) =>
        prev
          ? {
              ...prev,
              inputUid: kind === "input" ? uid : prev.inputUid,
              outputUid: kind === "output" ? uid : prev.outputUid,
            }
          : prev
      )
      void run(() => api.setDefaultDevice(uid, kind))
    },
    [run]
  )

  const setInputMuted = useCallback(
    (muted: boolean) => {
      setSnapshot((prev) => (prev ? { ...prev, micMuted: muted } : prev))
      void run(() => api.setInputMute(muted))
    },
    [run]
  )

  const setVolume = useCallback(
    (kind: DeviceKind, volume: number) => {
      lastLocalEditRef.current = Date.now()
      setSnapshot((prev) =>
        prev
          ? {
              ...prev,
              inputVolume: kind === "input" ? volume : prev.inputVolume,
              outputVolume: kind === "output" ? volume : prev.outputVolume,
            }
          : prev
      )
      void run(() => api.setDefaultVolume(kind, volume))
    },
    [run]
  )

  const routeApp = useCallback(
    (pid: number, targetUid: string) => run(() => api.routeApp(pid, targetUid)),
    [run]
  )

  const unrouteApp = useCallback(
    (pid: number) => {
      // Optimistic: drop the route locally; the pushed snapshot reconciles.
      setSnapshot((prev) =>
        prev
          ? { ...prev, routes: prev.routes.filter((r) => r.pid !== pid) }
          : prev
      )
      void run(() => api.unrouteApp(pid))
    },
    [run]
  )

  const setRouteVolume = useCallback(
    (pid: number, volume: number) => {
      lastLocalEditRef.current = Date.now()
      setSnapshot((prev) =>
        prev
          ? {
              ...prev,
              routes: prev.routes.map((r) =>
                r.pid === pid ? { ...r, volume } : r
              ),
            }
          : prev
      )
      void run(() => api.setAppVolume(pid, volume))
    },
    [run]
  )

  const stopAllRouting = useCallback(() => {
    setSnapshot((prev) => (prev ? { ...prev, routes: [] } : prev))
    void run(() => api.stopAllRouting())
  }, [run])

  const addRoutingRule = useCallback(
    (appName: string, targetUid: string, volume: number) =>
      run(() => api.addRoutingRule(appName, targetUid, volume)),
    [run]
  )

  const deleteRoutingRule = useCallback(
    (id: number) => {
      // Optimistic removal; the pushed snapshot reconciles.
      setSnapshot((prev) =>
        prev ? { ...prev, rules: prev.rules.filter((r) => r.id !== id) } : prev
      )
      void run(() => api.deleteRoutingRule(id))
    },
    [run]
  )

  const toggleRoutingRule = useCallback(
    (id: number, enabled: boolean) => {
      setSnapshot((prev) =>
        prev
          ? {
              ...prev,
              rules: prev.rules.map((r) =>
                r.id === id ? { ...r, enabled } : r
              ),
            }
          : prev
      )
      void run(() => api.toggleRoutingRule(id, enabled))
    },
    [run]
  )

  const savePreset = useCallback(
    (name: string) => run(() => api.savePreset(name)),
    [run]
  )

  const deletePreset = useCallback(
    (id: number) => {
      setSnapshot((prev) =>
        prev
          ? { ...prev, presets: prev.presets.filter((p) => p.id !== id) }
          : prev
      )
      void run(() => api.deletePreset(id))
    },
    [run]
  )

  const applyPreset = useCallback(
    (id: number) => run(() => api.applyPreset(id)),
    [run]
  )

  const dismissError = useCallback(() => setError(null), [])

  // Pull a fresh snapshot on demand. Whether an app is *playing* flips
  // without any CoreAudio notification we subscribe to, so views that list
  // audible apps poll with this.
  const refresh = useCallback(() => {
    api
      .getAudioSnapshot()
      .then(setSnapshot)
      .catch(() => {})
  }, [])

  return useMemo(
    () => ({
      snapshot,
      error,
      busy,
      setDefaultDevice,
      setInputMuted,
      setVolume,
      routeApp,
      unrouteApp,
      setRouteVolume,
      stopAllRouting,
      addRoutingRule,
      deleteRoutingRule,
      toggleRoutingRule,
      savePreset,
      deletePreset,
      applyPreset,
      dismissError,
      refresh,
    }),
    [
      snapshot,
      error,
      busy,
      setDefaultDevice,
      setInputMuted,
      setVolume,
      routeApp,
      unrouteApp,
      setRouteVolume,
      stopAllRouting,
      addRoutingRule,
      deleteRoutingRule,
      toggleRoutingRule,
      savePreset,
      deletePreset,
      applyPreset,
      dismissError,
      refresh,
    ]
  )
}

export { useAudioState }
