import {
  IconMicrophone,
  IconVideo,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { IconCard } from "@workspace/ui/components/icon-card"

import { SectionHeading } from "../components"

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
    <section id="features" className="container py-20">
      <SectionHeading
        eyebrow="Features"
        title="One controller for every tab"
        description="Mute, boost, mic, and camera — per tab, from one popup. No settings menus, no site-hunting."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <IconCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  )
}

export { FeaturesSection }
