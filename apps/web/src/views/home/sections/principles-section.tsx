import { IconBrandGithub, IconGift, IconLock } from "@tabler/icons-react"
import type { ComponentType } from "react"

import { IconCard } from "@workspace/ui/components/icon-card"

import { SectionHeading } from "@/views/extension/components"

type Principle = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const principles: Principle[] = [
  {
    icon: IconGift,
    title: "Free, no account",
    description:
      "Install and use it. No sign-up, no trial, no paywall on any control.",
  },
  {
    icon: IconLock,
    title: "Private by design",
    description:
      "Nothing is sent to a server. Settings stay on your device and audio never leaves it.",
  },
  {
    icon: IconBrandGithub,
    title: "Open source",
    description:
      "Both the extension and the Mac app live in one public repository you can read and build.",
  },
]

function PrinciplesSection() {
  return (
    <section className="container pb-20">
      <SectionHeading
        eyebrow="Principles"
        title="Small tools that respect you"
        description="Whichever one you install, the ground rules are the same."
      />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {principles.map((principle) => (
          <IconCard
            key={principle.title}
            icon={principle.icon}
            title={principle.title}
            description={principle.description}
          />
        ))}
      </div>
    </section>
  )
}

export { PrinciplesSection }
