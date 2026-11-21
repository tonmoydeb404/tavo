import { IconMicrophoneOff, IconPower } from "@tabler/icons-react"

import { Keycap, SignalLine } from "@/components/marketing"
import { cn } from "@workspace/ui/lib/utils"

import { SectionHeading } from "@/views/extension/components"

function Card({
  className,
  label,
  title,
  description,
  children,
}: {
  className?: string
  label: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <article
      className={cn(
        "flex flex-col justify-between gap-8 rounded-3xl border border-border bg-card p-6 sm:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs tracking-widest text-primary uppercase">
          {label}
        </span>
        <h3 className="font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {title}
        </h3>
        <p className="max-w-lg text-muted-foreground">{description}</p>
      </div>
      {children ? <div aria-hidden="true">{children}</div> : null}
    </article>
  )
}

function Pill({
  children,
  active,
}: {
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background"
      )}
    >
      {children}
    </span>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="container pb-24">
      <SectionHeading
        eyebrow="What it does"
        title="The audio controls macOS buried, in one menu"
      />

      <div className="mt-16 grid gap-4 lg:grid-cols-6">
        <Card
          className="lg:col-span-4"
          label="01 · Per-app routing"
          title="Send any app to any output."
          description="Tavo uses Core Audio process taps — Apple's own API — to play an app through the device you choose. Save a setup as a preset and apply it in one click. Needs macOS 14.2+."
        >
          <div className="flex flex-col gap-4">
            {[
              ["YouTube", "Speakers"],
              ["Zoom", "AirPods Pro"],
              ["Spotify", "Studio Display"],
            ].map(([app, device]) => (
              <div key={app} className="flex items-center gap-4">
                <Pill>{app}</Pill>
                <SignalLine />
                <Pill active>{device}</Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card
          className="lg:col-span-2"
          label="02 · Global mute"
          title="Mic off, everywhere."
          description="From the menu or a hotkey, whichever app has focus. Tavo mutes the device itself, so every app agrees."
        >
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <IconMicrophoneOff className="size-6" />
            </span>
            <div className="flex gap-2">
              <Keycap>⌃</Keycap>
              <Keycap>⌥</Keycap>
              <Keycap>M</Keycap>
            </div>
          </div>
        </Card>

        <Card
          className="lg:col-span-3"
          label="03 · Device switching"
          title="Plug in, pick, done."
          description="New headset? It shows up in the menu the moment it connects. No trip to System Settings."
        >
          <div className="flex flex-wrap gap-2">
            <Pill>MacBook Pro Microphone</Pill>
            <Pill active>AirPods Pro</Pill>
            <Pill>USB Condenser Mic</Pill>
          </div>
        </Card>

        <Card
          className="lg:col-span-3"
          label="04 · Stays out of the way"
          title="Light enough to forget."
          description="It lives in the menu bar — no dock icon, no window. Turn on launch at login and it's just there."
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconPower className="size-6" />
          </span>
        </Card>
      </div>
    </section>
  )
}

export { FeaturesSection }
