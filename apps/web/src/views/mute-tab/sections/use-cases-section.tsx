import {
  IconAdOff,
  IconBrandYoutube,
  IconMessage2Off,
  IconMovieOff,
  IconPlayerPause,
  IconVolumeOff,
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
    icon: IconAdOff,
    title: "Autoplay ads",
    description:
      "Mute the banner or pre-roll ad that started blasting the moment you opened a tab — without leaving the page.",
  },
  {
    icon: IconBrandYoutube,
    title: "Background YouTube",
    description:
      "Keep a YouTube tab open for later, muted, while you listen to something else in another tab.",
  },
  {
    icon: IconMessage2Off,
    title: "Notification spam",
    description:
      "Silence a tab that keeps firing sound effects for notifications, DMs, or pop-ups.",
  },
  {
    icon: IconMovieOff,
    title: "Loud background video",
    description:
      "Mute a news site or blog with a looping background video so you can actually read the article.",
  },
  {
    icon: IconPlayerPause,
    title: "Hold the meeting",
    description:
      "Quickly mute a Google Meet, Zoom, or Teams web tab while you take a side call — no host permission needed.",
  },
  {
    icon: IconVolumeOff,
    title: "Silent browsing",
    description:
      "Click through noisy auto-playing media on dozens of tabs and mute each in one click as you go.",
  },
]

function UseCasesSection() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Use cases"
          title="When per-tab mute saves the day"
          description="The moments one click of silence beats reaching for the system volume."
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
