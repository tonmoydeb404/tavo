import {
  IconMicrophone,
  IconMicrophoneOff,
  IconVideo,
  IconVideoOff,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"

import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

type Row = {
  /** Short site label */
  title: string
  /** Tailwind text color class for the favicon chip, e.g. "bg-red-500" */
  chip: string
  /** Single letter shown on the chip */
  initial: string
  /** 0..400 */
  volume: number
  muted?: boolean
  audible?: boolean
  /** When defined, shows a mic toggle. true = mic on. */
  mic?: boolean
  /** When defined, shows a webcam toggle. true = camera on. */
  camera?: boolean
}

const rows: Row[] = [
  {
    title: "youtube.com/watch",
    chip: "bg-red-500",
    initial: "Y",
    volume: 250,
    audible: true,
  },
  {
    title: "meet.google.com",
    chip: "bg-blue-500",
    initial: "M",
    volume: 100,
    mic: true,
    camera: false,
  },
  {
    title: "open.spotify.com",
    chip: "bg-emerald-500",
    initial: "S",
    volume: 80,
    audible: true,
  },
]

const MAX = 400

/**
 * A static, decorative mock of the extension's popup mixer.
 * Mirrors the real per-tab UI (favicon, title, audible dot, slider with
 * 100% unity marker, % readout, mute toggle) without any interactivity.
 */
function MixerMockup() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/95 p-3 shadow-2xl shadow-primary/10 ring-1 ring-foreground/5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="font-heading text-sm font-medium">Audio Tuner</span>
        <span className="text-[11px] text-muted-foreground">3 tabs</span>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <MixerMockupRow key={row.title} row={row} />
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        Volume above 100% may distort. Mic and camera toggle per tab.
      </p>
    </div>
  )
}

function MixerMockupRow({ row }: { row: Row }) {
  const boosted = row.volume > 100 && !row.muted
  const fill = (row.volume / MAX) * 100
  const unity = (100 / MAX) * 100

  return (
    <Card size="sm" className="gap-2.5">
      <div className="flex items-center gap-2 px-1">
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm text-[9px] font-bold text-white",
            row.chip,
          )}
        >
          {row.initial}
        </span>
        <span className="flex-1 truncate text-xs font-medium" title={row.title}>
          {row.title}
        </span>
        {row.audible && !row.muted ? (
          <span
            aria-label="Audible"
            className="size-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
            title="Playing audio"
          />
        ) : null}
        {row.mic !== undefined ? (
          <span
            aria-label={row.mic ? "Microphone on" : "Microphone off"}
            title={row.mic ? "Mic on" : "Mic off"}
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-md",
              row.mic
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {row.mic ? (
              <IconMicrophone className="size-3" />
            ) : (
              <IconMicrophoneOff className="size-3" />
            )}
          </span>
        ) : null}
        {row.camera !== undefined ? (
          <span
            aria-label={row.camera ? "Webcam on" : "Webcam off"}
            title={row.camera ? "Camera on" : "Camera off"}
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-md",
              row.camera
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {row.camera ? (
              <IconVideo className="size-3" />
            ) : (
              <IconVideoOff className="size-3" />
            )}
          </span>
        ) : null}
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md",
            row.muted
              ? "bg-destructive/10 text-destructive"
              : "text-muted-foreground",
          )}
          aria-label={row.muted ? "Muted" : "Audible"}
        >
          {row.muted ? (
            <IconVolumeOff className="size-3.5" />
          ) : (
            <IconVolume className="size-3.5" />
          )}
        </span>
      </div>

      <div className="flex items-center gap-3 px-1">
        <div className="relative h-3 flex-1">
          {/* track */}
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
          {/* fill */}
          <div
            className={cn(
              "absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full",
              row.muted
                ? "bg-muted-foreground/40"
                : boosted
                  ? "bg-amber-500"
                  : "bg-primary",
            )}
            style={{ width: `${fill}%` }}
          />
          {/* unity (100%) marker */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-foreground/40"
            style={{ left: `${unity}%` }}
          />
          {/* thumb */}
          <div
            className={cn(
              "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-white shadow-sm",
              boosted ? "border-amber-500" : "border-primary",
            )}
            style={{ left: `${fill}%` }}
          />
        </div>
        <span
          className={cn(
            "w-10 shrink-0 text-right tabular-nums text-[11px]",
            row.muted && "text-muted-foreground",
            boosted && "font-semibold text-amber-600",
          )}
        >
          {row.muted ? "muted" : `${row.volume}%`}
        </span>
      </div>
    </Card>
  )
}

export { MixerMockup }
