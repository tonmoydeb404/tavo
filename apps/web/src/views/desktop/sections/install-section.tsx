import { siteConfig } from "@/configs/site-config"

import { SectionHeading } from "@/views/extension/components"

import { CopyCommand } from "../components"

type Step = {
  title: string
  description: string
}

const steps: Step[] = [
  {
    title: "Install",
    description:
      "Run the one-liner, or grab the .dmg from GitHub Releases and drag Tavo into Applications.",
  },
  {
    title: "Allow audio access",
    description:
      "Only for app routing: macOS asks once under Privacy & Security → Screen & System Audio Recording. Device switching and mic mute need nothing.",
  },
  {
    title: "Use the menu bar",
    description:
      "Click the Tavo icon, pick a device, mute your mic, route an app. That's the whole manual.",
  },
]

function InstallSection() {
  return (
    <section id="install" className="container scroll-mt-20 pb-24">
      <div className="rounded-3xl border border-border bg-muted/50 p-6 sm:p-10 lg:p-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <SectionHeading
            eyebrow="Install"
            title="Up and running in a minute"
            description="No account, no config files. Needs Homebrew."
          />

          <CopyCommand
            command={siteConfig.desktop.installScript}
            className="mt-10 text-left"
          />

          <p className="mt-4 text-sm text-pretty text-muted-foreground">
            Tavo isn&apos;t notarized with Apple yet, so the installer clears
            the quarantine flag for you. Prefer to check first? The{" "}
            <a
              href={siteConfig.links.github}
              className="underline underline-offset-4 hover:text-foreground"
            >
              source is public
            </a>
            .
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <span className="font-heading text-5xl leading-none font-extrabold tracking-tighter text-primary">
                {index + 1}
              </span>
              <div>
                <h3 className="font-heading text-xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export { InstallSection }
