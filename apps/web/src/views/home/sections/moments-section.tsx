import { IconVolumeOff } from "@tabler/icons-react"

import { Keycap, SignalLine } from "@/components/marketing"
import { cn } from "@workspace/ui/lib/utils"

import { SectionHeading } from "@/views/extension/components"

function Tag({ children }: { children: string }) {
  return (
    <span className="w-fit rounded-full border border-border px-2.5 py-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
      {children}
    </span>
  )
}

function Tile({
  className,
  tag,
  title,
  description,
  children,
}: {
  className?: string
  tag: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <article
      className={cn(
        "flex flex-col justify-between gap-10 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <Tag>{tag}</Tag>
        <h3 className="max-w-md font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {title}
        </h3>
        <p className="max-w-md text-muted-foreground">{description}</p>
      </div>
      <div aria-hidden="true">{children}</div>
    </article>
  )
}

function Chip({
  children,
  muted,
}: {
  children: React.ReactNode
  muted?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium",
        muted && "text-muted-foreground line-through"
      )}
    >
      {children}
    </span>
  )
}

function MomentsSection() {
  return (
    <section id="moments" className="container py-24">
      <SectionHeading
        eyebrow="In the moment"
        title="Built for the exact second you reach for the volume"
        description="No dashboards, no settings maze. Small controls that appear where you already are."
      />

      <div className="mt-16 grid gap-4 lg:grid-cols-6">
        <Tile
          className="lg:col-span-4"
          tag="Extension"
          title="Quiet video? Turn it past 100%."
          description="Lecture recorded at a whisper, a call that never gets loud enough — push any tab up to 400%."
        >
          <div className="flex items-end justify-between gap-6">
            <span className="font-heading text-8xl leading-none font-extrabold tracking-tighter text-primary sm:text-9xl">
              400%
            </span>
            <div className="flex h-24 flex-1 items-end gap-1 text-primary">
              {Array.from({ length: 26 }).map((_, i) => (
                <span
                  key={i}
                  className="eq-bar h-full flex-1 rounded-full bg-current"
                  style={{
                    animationDelay: `${(i * 137) % 900}ms`,
                    animationDuration: `${800 + ((i * 53) % 700)}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </Tile>

        <Tile
          className="lg:col-span-2"
          tag="Extension"
          title="Mute one tab, not the site."
          description="Silence the autoplay ad and keep the music."
        >
          <div className="flex flex-wrap gap-2">
            <Chip muted>
              <IconVolumeOff className="size-4" />
              Autoplay ad
            </Chip>
            <Chip>Spotify</Chip>
            <Chip>Docs</Chip>
          </div>
        </Tile>

        <Tile
          className="lg:col-span-2"
          tag="Mac app"
          title="Mic off, in every app."
          description="One global hotkey. Zoom, Discord, a voice memo — all muted."
        >
          <div className="flex gap-2">
            <Keycap>⌃</Keycap>
            <Keycap>⌥</Keycap>
            <Keycap>M</Keycap>
          </div>
        </Tile>

        <Tile
          className="lg:col-span-4"
          tag="Mac app"
          title="YouTube on the speakers. The call in your earphones."
          description="macOS sends every app to one output. Tavo lets each app pick its own."
        >
          <div className="flex flex-col gap-4">
            {[
              ["YouTube", "MacBook Pro Speakers"],
              ["Zoom", "AirPods Pro"],
            ].map(([app, device]) => (
              <div key={app} className="flex items-center gap-4">
                <Chip>{app}</Chip>
                <SignalLine />
                <Chip>{device}</Chip>
              </div>
            ))}
          </div>
        </Tile>
      </div>
    </section>
  )
}

export { MomentsSection }
