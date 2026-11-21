import { useState } from "react"

import {
  IconChevronDown,
  IconMicrophone,
  IconMicrophoneOff,
  IconVolume,
} from "@tabler/icons-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import {
  ChoiceList,
  DeviceGlyph,
  DeviceIcon,
  Group,
  Row,
  Section,
  VolumeSlider,
} from "@/components"
import type { AudioDeviceInfo, DeviceKind } from "@/types"

type DeviceSectionProps = {
  kind: Extract<DeviceKind, "input" | "output">
  devices: AudioDeviceInfo[]
  currentUid: string | null
  volume: number | null
  busy: boolean
  onDeviceChange: (uid: string, kind: DeviceKind) => void
  onVolumeChange: (kind: DeviceKind, volume: number) => void
  /** Input only. */
  muted?: boolean
  inUse?: boolean
  onMuteChange?: (muted: boolean) => void
}

const COPY = {
  input: { title: "Microphone", empty: "No microphone found" },
  output: { title: "Output", empty: "No output device found" },
} as const

// One audio direction: current device + primary control, volume, and a
// collapsible device picker (collapsed by default — most of the time you
// only need the mute button and the level).
function DeviceSection({
  kind,
  devices,
  currentUid,
  volume,
  busy,
  onDeviceChange,
  onVolumeChange,
  muted = false,
  inUse = false,
  onMuteChange,
}: DeviceSectionProps) {
  const [open, setOpen] = useState(false)
  const isInput = kind === "input"
  const current = devices.find((d) => d.uid === currentUid)
  const copy = COPY[kind]

  return (
    <Section title={copy.title}>
      <Group>
        <Row
          leading={
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                muted
                  ? "bg-destructive/12 text-destructive"
                  : "bg-primary/12 text-primary"
              )}
            >
              {isInput ? (
                muted ? (
                  <IconMicrophoneOff className="size-5" />
                ) : (
                  <IconMicrophone className="size-5" />
                )
              ) : current ? (
                <DeviceGlyph
                  device={current}
                  kind="output"
                  className="size-5"
                />
              ) : (
                <IconVolume className="size-5" />
              )}
            </span>
          }
          title={current?.name ?? copy.empty}
          hint={
            current
              ? [
                  current.transport,
                  isInput && inUse ? "In use by an app" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : undefined
          }
          trailing={
            isInput && onMuteChange ? (
              <Button
                variant={muted ? "default" : "outline"}
                size="sm"
                className="rounded-lg"
                disabled={currentUid === null}
                onClick={() => onMuteChange(!muted)}
              >
                {muted ? "Unmute" : "Mute"}
              </Button>
            ) : null
          }
        >
          {volume !== null ? (
            <VolumeSlider
              value={volume}
              onChange={(v) => onVolumeChange(kind, v)}
              label={`${copy.title} volume`}
              disabled={muted}
              icon={<IconVolume />}
            />
          ) : null}
          {muted ? (
            <Badge variant="destructive" className="w-fit">
              Muted
            </Badge>
          ) : null}
        </Row>

        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-10 items-center justify-between px-3 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-muted/70 hover:text-foreground focus-visible:bg-muted"
        >
          Change {isInput ? "microphone" : "output"}
          <span className="flex items-center gap-1.5">
            {devices.length}
            <IconChevronDown
              className={cn(
                "size-4 transition-transform",
                open && "rotate-180"
              )}
            />
          </span>
        </button>

        {open ? (
          <ChoiceList
            label={`${copy.title} device`}
            selectedKey={currentUid}
            onSelect={(uid) => {
              if (!busy) onDeviceChange(uid, kind)
            }}
            choices={devices.map((d) => ({
              key: d.uid,
              primary: d.name,
              secondary: d.transport,
              leading: <DeviceIcon device={d} kind={kind} />,
            }))}
          />
        ) : null}
      </Group>
    </Section>
  )
}

export { DeviceSection }
