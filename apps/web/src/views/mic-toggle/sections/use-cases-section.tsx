import {
  IconMessage,
  IconMicrophone,
  IconPresentation,
  IconUsers,
  IconVideo,
  IconWorld,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { Card } from "@workspace/ui/components/card"

import { SectionHeading } from "@/views/home/components"

type UseCase = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const useCases: UseCase[] = [
  {
    icon: IconUsers,
    title: "Google Meet",
    description:
      "Mute from the toolbar the moment you stop speaking — no clicking through Meet’s on-screen controls.",
  },
  {
    icon: IconVideo,
    title: "Zoom web client",
    description:
      "Silence your mic in Zoom’s web client without hunting for its in-call button mid-meeting.",
  },
  {
    icon: IconMessage,
    title: "Microsoft Teams",
    description:
      "Toggle your mic in Teams on the web from one consistent place, every call.",
  },
  {
    icon: IconPresentation,
    title: "Webinars & events",
    description:
      "Hosting or attending a webinar? Cut your mic the instant background noise picks up.",
  },
  {
    icon: IconMicrophone,
    title: "Voice & recording tabs",
    description:
      "Stop a recording or voice tool from picking up your audio when you didn’t mean to share it.",
  },
  {
    icon: IconWorld,
    title: "Sites that hold mic access",
    description:
      "Shut out sites that asked for your mic once and never stopped listening.",
  },
]

function UseCasesSection() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Use cases"
          title="Where a toolbar mic mute helps"
          description="Any tab that can reach your microphone can be muted from the same place."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="gap-4 p-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <useCase.icon className="size-6" />
              </span>
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {useCase.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {useCase.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export { UseCasesSection }
