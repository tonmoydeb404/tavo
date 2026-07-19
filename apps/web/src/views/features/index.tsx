import Link from "next/link"
import {
  IconAdjustments,
  IconAdjustmentsHorizontal,
  IconBrandGithubFilled,
  IconCircleCheck,
  IconDownload,
  IconHeart,
  IconMicrophone,
  IconShieldLock,
  IconSparkles,
  IconVideo,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import { AudioWave, SectionHeading } from "@/views/home/components"

type CoreFeature = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  linkLabel: string
}

const coreFeatures: CoreFeature[] = [
  {
    icon: IconVolumeOff,
    title: "Mute one tab, not the whole site",
    description:
      "Silence just that one tab — not every tab on the same site like Chrome does. Keep your place, keep the tab open.",
    href: pathsConfig.muteTab,
    linkLabel: "Learn more about muting",
  },
  {
    icon: IconVolume,
    title: "Boost quiet audio past 100%",
    description:
      "Push a video's dialogue up to 400% so it's actually audible on tinny laptop speakers.",
    href: pathsConfig.volumeBooster,
    linkLabel: "Learn more about boost",
  },
  {
    icon: IconMicrophone,
    title: "Mute your mic in any meeting",
    description:
      "Kill your mic in Meet, Zoom, or Teams from the toolbar — no hunting for the in-call mute button.",
    href: pathsConfig.micToggle,
    linkLabel: "Learn more about the mic toggle",
  },
  {
    icon: IconVideo,
    title: "Turn off any tab's camera",
    description:
      "Kill the webcam from the toolbar — no clicking through the site to find its camera toggle.",
    href: pathsConfig.webcamToggle,
    linkLabel: "Learn more about the webcam toggle",
  },
]

type Detail = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const details: Detail[] = [
  {
    icon: IconAdjustments,
    title: "Per-tab volume slider",
    description:
      "Drag any tab from 0–400%, with a 100% unity marker so you always know the original level.",
  },
  {
    icon: IconSparkles,
    title: "Amber boost glow",
    description:
      "Boosted tabs glow amber so a loud one stands out at a glance.",
  },
  {
    icon: IconAdjustmentsHorizontal,
    title: "Audible-only filter",
    description:
      "Show only tabs making noise, or every tab you've got open — useful on busy sessions.",
  },
  {
    icon: IconCircleCheck,
    title: "One-click reset",
    description:
      "Reset any tab back to its default level in a single click.",
  },
  {
    icon: IconShieldLock,
    title: "Session-only storage",
    description:
      "Settings live in session storage and are wiped when the browser closes. No servers, no account.",
  },
  {
    icon: IconHeart,
    title: "Free and open source",
    description:
      "No paid tier, no trial, no upsell. Read the code, audit it, build it yourself.",
  },
]

function FeaturesView() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 size-[34rem] rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              <IconAdjustmentsHorizontal className="size-3.5 text-primary" />
              Features
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Everything Audio Tuner controls
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-white/70 sm:text-xl">
              A per-tab media controller for your browser — volume, mic, and
              webcam, all from one toolbar popup.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={siteConfig.links.cta}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <IconDownload className="size-4" />
                Add to Chrome — free
              </Link>
              <Link
                href={pathsConfig.faq}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white",
                )}
              >
                Read the FAQ
              </Link>
            </div>
            <div className="mt-4 w-full max-w-md text-primary/70">
              <AudioWave bars={48} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Core controls"
          title="The four per-tab controls"
          description="Each one is a per-tab switch that lives in your toolbar — what you change on one tab doesn't affect the others."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {coreFeatures.map((feature) => (
            <Card key={feature.title} className="gap-4 p-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <feature.icon className="size-6" />
              </span>
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {feature.linkLabel}
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="Inside the popup"
            title="Built for busy tab sessions"
            description="The small details that make per-tab control feel effortless."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {details.map((detail) => (
              <Card key={detail.title} className="gap-4 p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <detail.icon className="size-6" />
                </span>
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {detail.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {detail.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-border/60 bg-neutral-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <AudioWave
            className="mx-auto mb-8 h-10 w-48 text-primary/70"
            bars={40}
          />
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Try it on your noisiest tab
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-white/70">
            Install Audio Tuner and get volume, mic, and webcam controls on
            every tab — without digging through settings. Free, private, ready
            in seconds.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={siteConfig.links.cta}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <IconDownload className="size-4" />
              Add to Chrome
            </Link>
            <Link
              href={siteConfig.links.github}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              <IconBrandGithubFilled className="size-4" />
              View on GitHub
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export { FeaturesView }
