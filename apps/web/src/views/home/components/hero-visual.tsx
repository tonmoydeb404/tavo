import {
  IconBrandChrome,
  IconCheck,
  IconMicrophoneOff,
} from "@tabler/icons-react"

import { SignalLine } from "@/components/marketing"
import { cn } from "@workspace/ui/lib/utils"

type TabRow = {
  title: string
  swatch: string
  /** Volume as a percentage, 0–400. */
  level: number
  note?: string
}

const tabs: TabRow[] = [
  { title: "YouTube — lofi beats", swatch: "bg-primary", level: 35 },
  {
    title: "Google Meet — Standup",
    swatch: "bg-foreground",
    level: 100,
    note: "Mic muted",
  },
  { title: "Spotify Web Player", swatch: "bg-secondary", level: 240 },
]

const menuRows = [
  { label: "MacBook Pro Speakers", checked: true },
  { label: "AirPods Pro", checked: false },
  { label: "Studio Display", checked: false },
]

function Dots() {
  return (
    <span aria-hidden="true" className="flex gap-1.5">
      <span className="size-2.5 rounded-full bg-border" />
      <span className="size-2.5 rounded-full bg-border" />
      <span className="size-2.5 rounded-full bg-border" />
    </span>
  )
}

/**
 * Decorative composition for the home hero: a browser with per-tab volume on
 * the left, the Mac menu bar on the right, and audio flowing between them.
 */
function HeroVisual({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:gap-0",
        className
      )}
    >
      <div className="flex-1 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl lg:-rotate-1">
        <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-3">
          <Dots />
          <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            <IconBrandChrome className="size-3.5" />
            Chrome · 3 tabs playing
          </span>
        </div>
        <ul className="flex flex-col gap-1 p-3">
          {tabs.map((tab) => (
            <li
              key={tab.title}
              className="flex flex-col gap-2.5 rounded-xl px-3 py-3 hover:bg-muted/50"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("size-3 rounded-sm", tab.swatch)} />
                <span className="truncate text-sm font-medium">
                  {tab.title}
                </span>
                {tab.note ? (
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary">
                    <IconMicrophoneOff className="size-3" />
                    {tab.note}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-1.5 flex-1 rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    style={{ width: `${(tab.level / 400) * 100}%` }}
                  />
                  <div
                    className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background"
                    style={{ left: `${(tab.level / 400) * 100}%` }}
                  />
                </div>
                <span className="w-11 text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {tab.level}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center lg:w-24 lg:px-3">
        <span className="rotate-90 lg:hidden">
          <SignalLine className="w-12 flex-none" />
        </span>
        <SignalLine className="hidden lg:block" />
      </div>

      <div className="dark flex-1 overflow-hidden rounded-3xl border border-border bg-background text-foreground shadow-2xl lg:rotate-1">
        <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-3 font-mono text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Tavo</span>
          <span>macOS menu bar</span>
        </div>
        <div className="flex flex-col p-3 text-sm">
          <span className="px-3 py-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Output
          </span>
          {menuRows.map((row) => (
            <span
              key={row.label}
              className="flex items-center gap-2 rounded-md px-3 py-1.5"
            >
              <span className="flex size-4 items-center justify-center text-primary">
                {row.checked ? <IconCheck className="size-4" /> : null}
              </span>
              {row.label}
            </span>
          ))}
          <span className="my-2 h-px bg-border" />
          <span className="px-3 py-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Routing
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            YouTube → Speakers
          </span>
          <span className="flex items-center gap-2 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-primary" />
            Zoom → AirPods Pro
          </span>
        </div>
      </div>
    </div>
  )
}

export { HeroVisual }
