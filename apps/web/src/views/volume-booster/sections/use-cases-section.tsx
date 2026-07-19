import {
  IconBrandYoutube,
  IconDeviceTv,
  IconMicrophone,
  IconMovie,
  IconMusic,
  IconPodium,
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
    icon: IconBrandYoutube,
    title: "YouTube",
    description:
      "Boost quiet uploads, whispered dialogue, and lectures recorded on bad mics up to 400%.",
  },
  {
    icon: IconDeviceTv,
    title: "Netflix & streaming",
    description:
      "Match Netflix, Disney+, and HBO dialogue to the loudness of action scenes without reaching for your amp.",
  },
  {
    icon: IconMusic,
    title: "Spotify web player",
    description:
      "Push the Spotify web player past the browser ceiling so quiet masters fill the room.",
  },
  {
    icon: IconMicrophone,
    title: "Google Meet & Zoom",
    description:
      "Boost quiet callers in Meet, Zoom, and Teams web so you can actually hear the far end.",
  },
  {
    icon: IconMovie,
    title: "Twitch & live streams",
    description:
      "Lift quiet streamers or low-volume IRL feeds without touching the rest of your audio.",
  },
  {
    icon: IconPodium,
    title: "Podcasts & lectures",
    description:
      "Quiet podcasts and online courses become audible on tiny laptop speakers.",
  },
]

function UseCasesSection() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Use cases"
          title="What can you boost?"
          description="Any tab that plays audio can be pushed past 100%. These are the most common."
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
