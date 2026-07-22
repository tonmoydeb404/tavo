"use client"

import { brand } from "@workspace/brand"
import {
  MixerRow,
  type MixerRowActivity,
  type MixerRowState,
  type MixerRowTab,
} from "@workspace/ui/cards/mixer-row"

export type FeatureRow = {
  tab: MixerRowTab
  state: MixerRowState
  activity: MixerRowActivity
}

function noop() {}

/**
 * A parameterized static popup that renders the real `MixerRow` (from
 * `@workspace/ui`) inside the extension's popup chrome. Used by each
 * feature screenshot to show the relevant control state.
 *
 * Mirrors `MixerMockup` but accepts its rows as a prop so each feature
 * shot can tell its own story (one row muted, one row boosted, etc).
 */
function FeaturePopup({
  rows,
  showFootnote = true,
}: {
  rows: FeatureRow[]
  showFootnote?: boolean
}) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/30 p-3 shadow-2xl ring-1 shadow-primary/10 ring-foreground/5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="font-heading text-sm font-medium">{brand.name}</span>
        <span className="text-[11px] text-muted-foreground">
          {rows.length} {rows.length === 1 ? "tab" : "tabs"}
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

      {showFootnote ? (
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Volume above 100% may distort. Mic and camera toggle per tab.
        </p>
      ) : null}
    </div>
  )
}

export { FeaturePopup }
