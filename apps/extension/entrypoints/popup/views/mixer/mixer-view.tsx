import { IconAlertTriangle, IconVolumeOff, IconX } from "@tabler/icons-react"
import { MixerRow } from "@workspace/ui/cards/mixer-row"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"

import { MixerSkeleton } from "./mixer-skeleton"
import { useTabStates } from "./use-tab-states"

function MixerView() {
  const {
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
  } = useTabStates()

  return (
    <div className="flex w-full flex-col gap-3">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-base font-medium">Tavo</h1>
        <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Switch
            checked={showAll}
            onCheckedChange={setShowAll}
            aria-label="Show all tabs"
          />
          All tabs
        </Label>
      </header>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={dismissError}
            aria-label="Dismiss notice"
            className="-m-1 shrink-0 rounded p-1 hover:bg-destructive/20"
          >
            <IconX className="size-3.5" />
          </button>
        </div>
      ) : null}

      {!loaded ? (
        <MixerSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState audibleOnly={!showAll} />
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map(({ tab, state, activity }) => (
            <MixerRow
              key={tab.id ?? tab.url}
              tab={tab}
              state={state}
              activity={activity}
              onVolumeChange={setVolume}
              onMutedChange={setMuted}
              onMicMutedChange={setMicMuted}
              onCameraOffChange={setCameraOff}
              onReset={reset}
              onReloadTab={reloadTab}
            />
          ))}
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-center gap-1 text-[11px] leading-relaxed text-muted-foreground">
        <span>Volume above 100% may distort</span>
        <span aria-hidden="true">·</span>
        <span>Reload a tab if changes don&rsquo;t take effect</span>
      </footer>
    </div>
  )
}

function EmptyState({ audibleOnly }: { audibleOnly: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
      <IconVolumeOff className="size-8 opacity-40" />
      <p className="text-sm">
        {audibleOnly ? "No tabs playing audio." : "No tabs open."}
      </p>
      {audibleOnly ? (
        <p className="text-xs">
          Toggle &ldquo;All tabs&rdquo; to control any tab.
        </p>
      ) : null}
    </div>
  )
}

export { MixerView }
