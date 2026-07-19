"use client"

import { useCallback, useState } from "react"

import {
  IconBrowser,
  IconLoader,
  IconMicrophone,
  IconMicrophoneOff,
  IconRestore,
  IconVideo,
  IconVideoOff,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Slider } from "@workspace/ui/components/slider"
import { TooltipButton } from "@workspace/ui/custom/tooltip-button"
import { useToolbarKeyboardNav } from "@workspace/ui/hooks/use-toolbar-keyboard-nav"
import { cn } from "@workspace/ui/lib/utils"

// Volume slider ceiling (percent). 100 = unity gain.
const MIXER_ROW_MAX_VOLUME = 400

type MixerRowTab = {
  id?: number
  title?: string
  url?: string
  favIconUrl?: string
  active?: boolean
  audible?: boolean
}

type MixerRowState = {
  volume: number // 0..MIXER_ROW_MAX_VOLUME (percent)
  muted: boolean
  micMuted: boolean
  cameraOff: boolean
}

type MixerRowActivity = {
  hasMic: boolean
  hasCamera: boolean
}

type MixerRowProps = {
  tab: MixerRowTab
  state: MixerRowState
  activity: MixerRowActivity
  onVolumeChange: (tabId: number, volume: number) => void
  onMutedChange: (tabId: number, muted: boolean) => void
  onMicMutedChange: (tabId: number, micMuted: boolean) => void
  onCameraOffChange: (tabId: number, cameraOff: boolean) => void
  onReset: (tabId: number) => void
  onReloadTab: (tabId: number) => void
}

// Position of the 100% (unity) marker within a 0..MIXER_ROW_MAX_VOLUME slider.
const UNITY_PERCENT = (100 / MIXER_ROW_MAX_VOLUME) * 100

// Visual confirmation window after the user clicks reload. The actual
// browser.tabs.reload() fires immediately; this just signals "done."
const RELOAD_FEEDBACK_MS = 1500

// A single tab in the mixer. Vertical 3-row layout:
//   1. Header — favicon, title, status badges (active / audible)
//   2. Hero   — volume slider (0..400%) with a 100% unity marker + readout
//   3. Toolbar— mute (primary) · mic / camera / reset / reload
// The toolbar implements the WAI-ARIA toolbar pattern with arrow-key nav.
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
  const label = tab.title || tab.url || "Untitled"

  const [reloading, setReloading] = useState(false)
  const { ref: toolbarRef, onKeyDown } = useToolbarKeyboardNav()

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
    setReloading(true)
    onReloadTab(safeTabId)
    window.setTimeout(() => setReloading(false), RELOAD_FEEDBACK_MS)
  }, [onReloadTab, safeTabId])

  return (
    <Card size="sm" className="gap-2.5">
      <CardContent className="flex flex-col gap-2.5">
        {/* Row 1: header — favicon + title + status badges */}
        <div className="flex items-center gap-2">
          {tab.favIconUrl ? (
            <img
              src={tab.favIconUrl}
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0 object-contain"
            />
          ) : (
            <span className="size-4 shrink-0 rounded-sm bg-muted" />
          )}
          <span
            className="flex-1 truncate text-sm font-medium"
            title={tab.title ?? tab.url ?? undefined}
          >
            {label}
          </span>
          {tab.active ? (
            <Badge className="h-5 px-1.5 text-[10px] font-medium">Active</Badge>
          ) : null}
          {tab.audible ? (
            <Badge
              variant="secondary"
              className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <span
                className="size-1.5 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              Audible
            </Badge>
          ) : null}
        </div>

        {/* Row 2: hero slider with 100% unity marker + readout */}
        <div className="flex items-center gap-3">
          <div className="relative flex flex-1 items-center">
            <Slider
              min={0}
              max={MIXER_ROW_MAX_VOLUME}
              value={[state.volume]}
              onValueChange={handleVolume}
              aria-label={`Volume for ${label}`}
              aria-valuetext={`${state.volume} percent`}
              className={cn(
                "flex-1",
                state.volume > 100 && "**:data-[slot=slider-range]:bg-amber-500"
              )}
            />
            {/* Unity (100%) marker */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 z-10 h-2.5 w-px -translate-y-1/2 bg-foreground/40"
              style={{ left: `${UNITY_PERCENT}%` }}
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

        {/* Row 3: toolbar — mute (primary) | mic · camera · reset | reload */}
        <div
          ref={toolbarRef}
          role="toolbar"
          aria-label={`Controls for ${label}`}
          onKeyDown={onKeyDown}
          className="flex items-center gap-1"
        >
          <Button
            variant={state.muted ? "destructive" : "outline"}
            size="sm"
            onClick={handleMuted}
            aria-label={state.muted ? "Unmute tab" : "Mute tab"}
            aria-pressed={state.muted}
            className="min-w-16 flex-1"
          >
            {state.muted ? <IconVolumeOff /> : <IconVolume />}
            {state.muted ? "Muted" : "Mute"}
          </Button>
          <Separator orientation="vertical" className="mx-0.5 h-6" />
          <TooltipButton
            variant={state.micMuted ? "destructive" : "ghost"}
            size="icon-sm"
            onClick={handleMic}
            disabled={!activity.hasMic}
            aria-label={state.micMuted ? "Unmute mic" : "Mute mic"}
            aria-pressed={state.micMuted}
            tooltip={
              !activity.hasMic
                ? "No microphone active in this tab"
                : state.micMuted
                  ? "Unmute microphone"
                  : "Mute microphone (tab reload needed if already in a call)"
            }
          >
            {state.micMuted ? <IconMicrophoneOff /> : <IconMicrophone />}
          </TooltipButton>
          <TooltipButton
            variant={state.cameraOff ? "destructive" : "ghost"}
            size="icon-sm"
            onClick={handleCamera}
            disabled={!activity.hasCamera}
            aria-label={state.cameraOff ? "Turn camera on" : "Turn camera off"}
            aria-pressed={state.cameraOff}
            tooltip={
              !activity.hasCamera
                ? "No camera active in this tab"
                : state.cameraOff
                  ? "Turn camera on"
                  : "Turn camera off (tab reload needed if already in a call)"
            }
          >
            {state.cameraOff ? <IconVideoOff /> : <IconVideo />}
          </TooltipButton>
          <TooltipButton
            variant="ghost"
            size="icon-sm"
            onClick={handleReset}
            aria-label="Reset volume and mute"
            disabled={!isAdjusted}
            tooltip={
              isAdjusted
                ? "Reset to defaults (100% volume, unmuted)"
                : "Already at defaults"
            }
          >
            <IconRestore />
          </TooltipButton>
          <Separator orientation="vertical" className="mx-0.5 h-6" />
          <TooltipButton
            variant="ghost"
            size="icon-sm"
            onClick={handleReload}
            aria-label="Reload tab"
            disabled={reloading}
            tooltip="Reload tab - use if volume, mic, or camera isn't taking effect"
          >
            {reloading ? (
              <IconLoader className="animate-spin" />
            ) : (
              <IconBrowser />
            )}
          </TooltipButton>
        </div>
      </CardContent>
    </Card>
  )
}

export { MIXER_ROW_MAX_VOLUME, MixerRow }
export type { MixerRowActivity, MixerRowProps, MixerRowState, MixerRowTab }
