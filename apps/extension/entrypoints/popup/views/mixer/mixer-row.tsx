import { useCallback } from "react"

import {
  IconMicrophone,
  IconMicrophoneOff,
  IconRefresh,
  IconReload,
  IconVideo,
  IconVideoOff,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Slider } from "@workspace/ui/components/slider"
import { cn } from "@workspace/ui/lib/utils"

import { MAX_VOLUME, type MediaActivity, type TabState } from "@/lib/messaging"

import type { Tab } from "./use-tab-states"

type MixerRowProps = {
  tab: Tab
  state: TabState
  activity: MediaActivity
  onVolumeChange: (tabId: number, volume: number) => void
  onMutedChange: (tabId: number, muted: boolean) => void
  onMicMutedChange: (tabId: number, micMuted: boolean) => void
  onCameraOffChange: (tabId: number, cameraOff: boolean) => void
  onReset: (tabId: number) => void
  onReloadTab: (tabId: number) => void
}

// Position of the 100% (unity) marker within a 0..MAX_VOLUME slider.
const UNITY_PERCENT = (100 / MAX_VOLUME) * 100

// A single row in the mixer: favicon + title + audible indicator,
// volume slider (0..400%) with a 100% unity marker, mute toggle, reset,
// and a reload-tab button (use when volume isn't taking effect because the
// tab predates the extension).
function MixerRow({
  tab,
  state,
  activity,
  onVolumeChange,
  onMutedChange,
  onMicMutedChange,
  onCameraOffChange,
  onReset,
  onReloadTab,
}: MixerRowProps) {
  const tabId = tab.id
  const safeTabId = tabId ?? -1
  const isAdjusted =
    state.volume !== 100 || state.muted || state.micMuted || state.cameraOff

  const handleVolume = useCallback(
    (value: number | readonly number[]) => {
      const next = Array.isArray(value) ? (value[0] ?? 0) : value
      onVolumeChange(safeTabId, next)
    },
    [onVolumeChange, safeTabId]
  )

  const handleMuted = useCallback(() => {
    onMutedChange(safeTabId, !state.muted)
  }, [onMutedChange, safeTabId, state.muted])

  const handleMic = useCallback(() => {
    onMicMutedChange(safeTabId, !state.micMuted)
  }, [onMicMutedChange, safeTabId, state.micMuted])

  const handleCamera = useCallback(() => {
    onCameraOffChange(safeTabId, !state.cameraOff)
  }, [onCameraOffChange, safeTabId, state.cameraOff])

  const handleReset = useCallback(() => {
    onReset(safeTabId)
  }, [onReset, safeTabId])

  const handleReload = useCallback(() => {
    onReloadTab(safeTabId)
  }, [onReloadTab, safeTabId])

  return (
    <Card
      size="sm"
      className={cn("gap-2", tab.active && "ring-2 ring-primary/60")}
    >
      <CardContent>
        <div className="flex items-center gap-2 px-1">
          {tab.favIconUrl ? (
            <img
              src={tab.favIconUrl}
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0 rounded-sm object-contain"
            />
          ) : (
            <span className="size-4 shrink-0 rounded-sm bg-muted" />
          )}

          <span
            className="flex-1 truncate text-sm font-medium"
            title={tab.title ?? tab.url ?? undefined}
          >
            {tab.title || tab.url || "Untitled"}
          </span>

          {tab.audible ? (
            <span
              aria-label="Audible"
              className="size-2 shrink-0 rounded-full bg-emerald-500"
              title="Playing audio"
            />
          ) : null}

          <Button
            variant={state.muted ? "destructive" : "ghost"}
            size="icon-sm"
            onClick={handleMuted}
            aria-label={state.muted ? "Unmute tab" : "Mute tab"}
            aria-pressed={state.muted}
            title={state.muted ? "Unmute playback" : "Mute playback"}
          >
            {state.muted ? <IconVolumeOff /> : <IconVolume />}
          </Button>
          <Button
            variant={state.micMuted ? "destructive" : "ghost"}
            size="icon-sm"
            onClick={handleMic}
            disabled={!activity.hasMic}
            aria-label={state.micMuted ? "Unmute mic" : "Mute mic"}
            aria-pressed={state.micMuted}
            title={
              !activity.hasMic
                ? "No microphone active in this tab"
                : state.micMuted
                  ? "Unmute microphone"
                  : "Mute microphone (requires tab reload if already in a call)"
            }
          >
            {state.micMuted ? <IconMicrophoneOff /> : <IconMicrophone />}
          </Button>
          <Button
            variant={state.cameraOff ? "destructive" : "ghost"}
            size="icon-sm"
            onClick={handleCamera}
            disabled={!activity.hasCamera}
            aria-label={state.cameraOff ? "Turn camera on" : "Turn camera off"}
            aria-pressed={state.cameraOff}
            title={
              !activity.hasCamera
                ? "No camera active in this tab"
                : state.cameraOff
                  ? "Turn camera on"
                  : "Turn camera off (requires tab reload if already in a call)"
            }
          >
            {state.cameraOff ? <IconVideoOff /> : <IconVideo />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleReset}
            aria-label="Reset volume and mute"
            title="Reset"
            disabled={!isAdjusted}
          >
            <IconRefresh />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleReload}
            aria-label="Reload tab"
            title="Reload tab (use if volume, mic, or camera isn't taking effect)"
          >
            <IconReload />
          </Button>
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="relative flex flex-1 items-center">
            <Slider
              min={0}
              max={MAX_VOLUME}
              value={[state.volume]}
              onValueChange={handleVolume}
              aria-label={`Volume for ${tab.title ?? "tab"}`}
              className={cn(
                "flex-1",
                state.volume > 100 &&
                  "[&_[data-slot=slider-range]]:bg-amber-500"
              )}
            />
            {/* Unity (100%) marker */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 z-10 h-2 w-px -translate-y-1/2 bg-foreground/40"
              style={{ left: `${UNITY_PERCENT}%` }}
              title="Original volume (100%)"
            />
          </div>
          <span
            className={cn(
              "w-12 shrink-0 text-right text-xs tabular-nums",
              state.volume > 100 && "font-semibold text-amber-600",
              state.volume === 0 && "text-muted-foreground"
            )}
          >
            {state.volume}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export { MixerRow }
