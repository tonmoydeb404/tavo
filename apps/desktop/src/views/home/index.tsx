import { IconHeadphones } from "@tabler/icons-react"

import { EmptyState, Kbd, Notice } from "@/components"
import { useAudioState } from "@/hooks/use-audio-state"

import { DeviceSection } from "./sections"

function HomeView() {
  const {
    snapshot,
    error,
    busy,
    setDefaultDevice,
    setInputMuted,
    setVolume,
    dismissError,
  } = useAudioState()

  return (
    <>
      {error ? <Notice onDismiss={dismissError}>{error}</Notice> : null}

      {!snapshot ? (
        <EmptyState
          icon={<IconHeadphones className="size-8 animate-pulse" />}
          title="Reading audio devices…"
        />
      ) : (
        <>
          <DeviceSection
            kind="input"
            devices={snapshot.devices.filter((d) => d.isInput)}
            currentUid={snapshot.inputUid}
            volume={snapshot.inputVolume}
            muted={snapshot.micMuted === true}
            inUse={snapshot.micInUse}
            busy={busy}
            onMuteChange={setInputMuted}
            onDeviceChange={setDefaultDevice}
            onVolumeChange={setVolume}
          />
          <DeviceSection
            kind="output"
            devices={snapshot.devices.filter((d) => d.isOutput)}
            currentUid={snapshot.outputUid}
            volume={snapshot.outputVolume}
            busy={busy}
            onDeviceChange={setDefaultDevice}
            onVolumeChange={setVolume}
          />
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            Mute your mic from anywhere with <Kbd>⌥⌘M</Kbd>
          </p>
        </>
      )}
    </>
  )
}

export { HomeView }
