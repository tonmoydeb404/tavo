import {
  IconDownload,
  IconShieldCheck,
  IconTerminal2,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { siteConfig } from "@/configs/site-config"
import { IconCard } from "@workspace/ui/components/icon-card"

import { SectionHeading } from "@/views/extension/components"

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
      "Run the one-line installer below, or download the .dmg from GitHub Releases and drag Tavo into Applications.",
  },
  {
    icon: IconShieldCheck,
    title: "Allow audio access",
    description:
      "To route an app's audio, macOS asks for permission under Privacy & Security → Screen & System Audio Recording. Device switching and mic mute need none.",
  },
  {
    icon: IconTerminal2,
    title: "Use the menu bar",
    description:
      "Click the Tavo icon, pick a device, mute your mic, or route an app. That's it.",
  },
]

function InstallSection() {
  return (
    <section id="install" className="container py-20">
      <SectionHeading
        eyebrow="Install"
        title="Up and running in a minute"
        description="Apple Silicon Macs. Free, with no account and no configuration files."
      />

      <div className="mx-auto mt-10 max-w-3xl overflow-x-auto rounded-xl border border-border/60 bg-card px-5 py-4 text-left">
        <code className="font-mono text-sm whitespace-nowrap">
          {siteConfig.desktop.installScript}
        </code>
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Requires{" "}
        <a
          href="https://brew.sh"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Homebrew
        </a>
        . The app is not yet notarized, and the installer clears the macOS
        quarantine flag for you.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
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

export { InstallSection }
