import { IconAdjustments, IconDownload, IconPin } from "@tabler/icons-react"
import type { ComponentType } from "react"

import { IconCard } from "@workspace/ui/components/icon-card"

import { SectionHeading } from "@/views/home/components"

type Step = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const steps: Step[] = [
  {
    icon: IconDownload,
    title: "Install Audio Tuner",
    description:
      "Add Audio Tuner from the Chrome Web Store. It also works in Edge and Brave — any Chromium browser.",
  },
  {
    icon: IconPin,
    title: "Pin the toolbar icon",
    description:
      "Click the puzzle piece in your toolbar and pin Audio Tuner so every control is one click away.",
  },
  {
    icon: IconAdjustments,
    title: "Take control of any tab",
    description:
      "Open the popup and adjust the tab you’re on — drag the volume slider, flip the mic, or kill the camera. Every control is per tab.",
  },
]

function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Quick start"
        title="Per-tab control in under a minute"
        description="No accounts, no configuration files, no permissions gymnastics. Install and take control."
      />

      <div className="relative mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <IconCard
            key={step.title}
            icon={step.icon}
            title={step.title}
            description={step.description}
            number={index + 1}
          />
        ))}
      </div>
    </section>
  )
}

export { HowItWorksSection }
