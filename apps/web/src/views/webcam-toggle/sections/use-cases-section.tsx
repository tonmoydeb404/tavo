import {
  IconDeviceDesktop,
  IconMessage,
  IconShieldLock,
  IconUsers,
  IconVideo,
  IconWorld,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { IconCard } from "@workspace/ui/components/icon-card"

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
      "Turn your camera off in Meet from the toolbar — no fumbling for the in-call video button.",
  },
  {
    icon: IconVideo,
    title: "Zoom web client",
    description:
      "Kill the camera in Zoom’s web client without digging through its controls.",
  },
  {
    icon: IconMessage,
    title: "Microsoft Teams",
    description:
      "Black out your video feed in Teams on the web, from one place every time.",
  },
  {
    icon: IconShieldLock,
    title: "Proctoring & exam tools",
    description:
      "Shut the camera on proctoring and identity-verification sites the moment you’re done.",
  },
  {
    icon: IconWorld,
    title: "Chat & social sites",
    description:
      "Keep your camera off on chat and roulette sites that default to video.",
  },
  {
    icon: IconDeviceDesktop,
    title: "Recording & effects tabs",
    description:
      "Stop a recording or effects tab from seeing you when you didn’t ask it to.",
  },
]

function UseCasesSection() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Use cases"
          title="Where a toolbar camera toggle helps"
          description="Any tab that can reach your webcam can be turned off from the same place."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <IconCard
              key={useCase.title}
              icon={useCase.icon}
              title={useCase.title}
              description={useCase.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export { UseCasesSection }
