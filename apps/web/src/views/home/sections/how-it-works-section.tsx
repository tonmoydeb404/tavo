import { IconAdjustments, IconDownload, IconPin } from "@tabler/icons-react"
import type { ComponentType } from "react"

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
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6"
    >
      <SectionHeading
        eyebrow="How it works"
        title="Running in under a minute"
        description="No accounts, no configuration files, no permissions gymnastics. Install and take control."
      />

      <div className="relative mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="size-6" />
              </span>
              <span className="font-heading text-5xl font-bold text-primary/15">
                {index + 1}
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export { HowItWorksSection }
