import { IconAdjustments, IconDownload, IconPin } from "@tabler/icons-react"
import type { ComponentType } from "react"

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
      "Click the puzzle piece in your toolbar and pin Audio Tuner so it is one click away whenever a tab is too quiet.",
  },
  {
    icon: IconAdjustments,
    title: "Drag the slider past 100%",
    description:
      "Open the popup, find the tab you want louder, and drag its slider up to 400%. Boosted tabs glow amber.",
  },
]

function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Quick start"
        title="Louder audio in under a minute"
        description="No accounts, no configuration files, no permissions gymnastics. Install and boost."
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
