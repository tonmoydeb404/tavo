import { IconArrowRight, IconX } from "@tabler/icons-react"

import { Keycap } from "@/components/marketing"

import { SectionHeading } from "@/views/extension/components"

const oldWay = [
  "Open System Settings",
  "Find Sound",
  "Switch to the Input tab",
  "Pick the new microphone",
  "Go back to the call",
  "Hunt for the mute button",
  "Hope it's the right window",
]

function ProblemSection() {
  return (
    <section className="container py-24">
      <SectionHeading
        eyebrow="Why Tavo"
        title="Seven steps to change a microphone is six too many"
        description="macOS keeps its audio controls deep in settings, and sends every app to the same output — so a call and a video always fight over one speaker."
      />

      <div className="mt-16 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-3xl border border-border bg-card p-8">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Without Tavo
          </span>
          <ol className="mt-6 flex flex-col gap-3">
            {oldWay.map((step, index) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-center gap-2 text-sm font-medium">
            <IconX className="size-4 text-destructive" />
            And the call is still waiting.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <IconArrowRight className="size-8 rotate-90 text-primary lg:rotate-0" />
        </div>

        <div className="dark flex flex-col justify-between rounded-3xl border border-border bg-background p-8 text-foreground">
          <div>
            <span className="font-mono text-xs tracking-widest text-primary uppercase">
              With Tavo
            </span>
            <p className="mt-6 font-heading text-8xl leading-none font-extrabold tracking-tighter">
              1
            </p>
            <p className="mt-2 text-xl font-semibold">click.</p>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Open the menu, pick the device. Or don&apos;t even open it — your
              hotkey mutes the mic from whatever app has focus.
            </p>
          </div>
          <div className="mt-8 flex gap-2">
            <Keycap>⌃</Keycap>
            <Keycap>⌥</Keycap>
            <Keycap>M</Keycap>
          </div>
        </div>
      </div>
    </section>
  )
}

export { ProblemSection }
