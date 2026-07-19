import { IconDownload, IconPin, IconVideoOff } from "@tabler/icons-react"
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
      "Click the puzzle piece in your toolbar and pin Audio Tuner so the camera toggle is one click away on any site.",
  },
  {
    icon: IconVideoOff,
    title: "Flip the camera off",
    description:
      "Open the popup and tap the camera toggle on the tab you’re in. That tab’s webcam feed stops until you turn it back on.",
  },
]

function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Quick start"
        title="A dark camera in under a minute"
        description="No accounts, no configuration files, no permissions gymnastics. Install and switch off."
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
