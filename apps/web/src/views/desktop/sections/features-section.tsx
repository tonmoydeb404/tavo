import {
  IconArrowsSplit,
  IconMicrophoneOff,
  IconPower,
  IconSwitchHorizontal,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { IconCard } from "@workspace/ui/components/icon-card"

import { SectionHeading } from "@/views/extension/components"

type Feature = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: IconSwitchHorizontal,
    title: "Switch devices from the menu bar",
    description:
      "Pick your microphone and output device from a single menu. Plug in a headset and switch to it without opening System Settings.",
  },
  {
    icon: IconMicrophoneOff,
    title: "Mute your mic globally",
    description:
      "Mute and unmute your microphone from the menu bar or a global hotkey, whichever app has focus. It works across every app that uses the mic.",
  },
  {
    icon: IconArrowsSplit,
    title: "Route any app to any output",
    description:
      "Send YouTube to your speakers while a call plays on your earphones. Save a setup as a preset and apply it in one click. Needs macOS 14.2 or later.",
  },
  {
    icon: IconPower,
    title: "Light, and out of your way",
    description:
      "Tavo lives in the menu bar, out of your way. Turn on launch at login and it's ready whenever you are.",
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="container py-20">
      <SectionHeading
        eyebrow="Features"
        title="System audio, under your control"
        description="The audio controls macOS keeps buried in settings, gathered in one menu."
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
