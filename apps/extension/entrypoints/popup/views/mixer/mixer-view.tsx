import { IconVolumeOff } from "@tabler/icons-react"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"

import { useTabStates } from "./use-tab-states"
import { MixerRow } from "./mixer-row"

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
  } = useTabStates()

  return (
    <div className="flex w-full flex-col gap-3">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-medium">Audio Tuner</h1>
        <Label className="text-xs text-muted-foreground">
          <Switch
            checked={showAll}
            onCheckedChange={setShowAll}
            size="sm"
            aria-label="Show all tabs"
          />
          Show all tabs
        </Label>
      </header>

      {rows.length === 0 ? (
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

      <footer className="text-center text-[11px] leading-relaxed text-muted-foreground">
        <p>Volume above 100% may distort. Mute is browser-native.</p>
        <p>
          Not working on a tab that was already open? Use its{" "}
          <span className="font-medium">reload</span> button once.
        </p>
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
          Toggle &ldquo;Show all tabs&rdquo; to control any tab.
        </p>
      ) : null}
    </div>
  )
}

export { MixerView }
