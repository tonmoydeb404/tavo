import {
  IconMicrophone,
  IconShieldLock,
  IconSparkles,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { BrandMark } from "../components/brand-mark"

type Pillar = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const pillars: Pillar[] = [
  {
    icon: IconVolumeOff,
    title: "Mute one tab",
    description: "Not the whole site. Keep your place, keep the tab.",
  },
  {
    icon: IconVolume,
    title: "Boost to 400%",
    description: "Make quiet dialogue audible on laptop speakers.",
  },
  {
    icon: IconMicrophone,
    title: "Mic & webcam",
    description: "Toggle either from the toolbar, per tab.",
  },
  {
    icon: IconShieldLock,
    title: "Private by default",
    description: "Session-only storage. No servers, no account.",
  },
]

/**
 * 1400x560 — Chrome Web Store "marquee promotional tile".
 *
 * A wide banner used for the store's featured spots. Brand block on the
 * left, four control pillars on the right.
 */
function BannerScreenshot() {
  return (
    <div className="relative flex h-full w-full items-stretch overflow-hidden bg-background">
      {/* Left brand panel */}
      <div className="relative flex w-[44%] flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-black/10 blur-3xl"
        />

        <BrandMark
          glyphClassName="size-12 bg-primary-foreground text-primary"
          className="relative text-primary-foreground [&_span]:text-primary-foreground"
        />

        <div className="relative">
          <h1 className="font-heading text-5xl font-bold leading-[1.05] tracking-tight text-balance">
            Per-tab audio, mic &amp; camera — from your toolbar
          </h1>
          <p className="mt-4 max-w-md text-lg text-primary-foreground/85">
            One popup, every tab. Volume, mute, mic, and webcam controls that
            don&apos;t touch each other.
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-sm font-medium text-primary-foreground/85">
          <IconSparkles className="size-4" />
          Free · Chrome · Edge · Brave · No account
        </div>
      </div>

      {/* Right pillars */}
      <div className="flex flex-1 flex-col justify-center gap-4 p-12">
        <div className="grid grid-cols-2 gap-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-border/60 bg-muted/40 p-5"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-heading mt-3 text-lg font-semibold tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-1 text-sm text-pretty text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { BannerScreenshot }
