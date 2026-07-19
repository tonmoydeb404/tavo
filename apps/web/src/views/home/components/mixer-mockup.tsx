"use client"

import { siteConfig } from "@/configs/site-config"
import {
  MixerRow,
  type MixerRowActivity,
  type MixerRowState,
  type MixerRowTab,
} from "@workspace/ui/cards/mixer-row"

type Row = {
  tab: MixerRowTab
  state: MixerRowState
  activity: MixerRowActivity
}

const rows: Row[] = [
  {
    tab: {
      id: 1,
      title: "youtube.com/watch",
      audible: true,
      favIconUrl: "https://www.youtube.com/s/desktop/e2e75771/img/favicon.ico",
    },
    state: { volume: 50, muted: false, micMuted: false, cameraOff: false },
    activity: { hasMic: false, hasCamera: false },
  },
  {
    tab: {
      id: 2,
      title: "meet.google.com",
      favIconUrl: "https://www.gstatic.com/meet/icons/favicon-2026-v2-96dp.png",
    },
    state: { volume: 150, muted: false, micMuted: false, cameraOff: true },
    activity: { hasMic: true, hasCamera: true },
  },
]

// No-op handlers — the mockup is decorative and never actually mutates state.
function noop() {}

/**
 * A static, decorative mock of the extension's popup mixer. Renders the real
 * `MixerRow` component (from `@workspace/ui`) with fixed sample data, so the
 * marketing site always mirrors the actual extension UI.
 */
function MixerMockup() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/30 p-3 shadow-2xl ring-1 shadow-primary/10 ring-foreground/5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="font-heading text-sm font-medium">
          {siteConfig.brand.name}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {rows.length} tabs
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map(({ tab, state, activity }) => (
          <MixerRow
            key={tab.id}
            tab={tab}
            state={state}
            activity={activity}
            onVolumeChange={noop}
            onMutedChange={noop}
            onMicMutedChange={noop}
            onCameraOffChange={noop}
            onReset={noop}
            onReloadTab={noop}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        Volume above 100% may distort. Mic and camera toggle per tab.
      </p>
    </div>
  )
}

export { MixerMockup }
