import Link from "next/link"
import {
  IconAdjustments,
  IconAdjustmentsHorizontal,
  IconCircleCheck,
  IconHeart,
  IconMicrophone,
  IconShieldLock,
  IconSparkles,
  IconVideo,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { CtaSection, HeroSection } from "@/components/sections"
import { pathsConfig } from "@/configs/path-config"
import { IconCard } from "@workspace/ui/components/icon-card"

import { SectionHeading } from "@/views/home/components"

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
    description: "Reset any tab back to its default level in a single click.",
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
      <HeroSection
        badgeIcon={IconAdjustmentsHorizontal}
        badgeText="Features"
        title="Everything Audio Tuner controls"
        description="A per-tab media controller for your browser — volume, mic, and webcam, all from one toolbar popup."
        secondaryCta={{ href: pathsConfig.faq, label: "Read the FAQ" }}
      />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Core controls"
          title="The four per-tab controls"
          description="Each one is a per-tab switch that lives in your toolbar — what you change on one tab doesn't affect the others."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {coreFeatures.map((feature) => (
            <IconCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            >
              <Link
                href={feature.href}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {feature.linkLabel}
              </Link>
            </IconCard>
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
              <IconCard
                key={detail.title}
                icon={detail.icon}
                title={detail.title}
                description={detail.description}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}

export { FeaturesView }
