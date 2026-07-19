import { IconAdjustments, IconDownload, IconPin } from "@tabler/icons-react"
import type { ComponentType } from "react"

import { IconCard } from "@workspace/ui/components/icon-card"

import { SectionHeading } from "../components"

type Step = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const steps: Step[] = [
  {
    icon: IconDownload,
    title: "Install",
    description:
      "Add Audio Tuner from the Chrome Web Store in a single click. It works in Chrome, Edge, and Brave.",
  },
  {
    icon: IconPin,
    title: "Pin it",
    description:
      "Click the puzzle icon in your toolbar and pin Audio Tuner for one-click access, any time.",
  },
  {
    icon: IconAdjustments,
    title: "Take control",
    description:
      "Open the popup, drag the sliders, flip your mic or camera off. That's it.",
  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="How it works"
        title="Running in under a minute"
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
