import {
  IconMicrophone,
  IconVideo,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { Card } from "@workspace/ui/components/card"

import { SectionHeading } from "@/views/home/components"

type Feature = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: IconVolumeOff,
    title: "Mute one tab, not the whole site",
    description:
      "Silence just that one tab — not every tab on the same site like Chrome does. Keep your place, keep the tab open.",
  },
  {
    icon: IconVolume,
    title: "Boost quiet audio past 100%",
    description:
      "Push a video's dialogue up to 400% so it's actually audible on tinny laptop speakers.",
  },
  {
    icon: IconMicrophone,
    title: "Mute your mic in any meeting",
    description:
      "Kill your mic in Meet, Zoom, or Teams from the toolbar — no hunting for the in-call mute button.",
  },
  {
    icon: IconVideo,
    title: "Turn off any tab's camera",
    description:
      "Kill the webcam from the toolbar — no clicking through the site to find its camera toggle.",
  },
]

function FeaturesSection() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="What it controls"
          title="One controller, every tab"
          description="Volume, mic, and camera — each one a per-tab switch in your toolbar."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
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
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export { FeaturesSection }
