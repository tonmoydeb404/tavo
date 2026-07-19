import { SectionHeading } from "@/views/home/components"

function WhyMicSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="How it works"
        title="Why a per-tab mic toggle matters"
        description="Your browser hands out microphone access per site, then gives you no single switch to take it back. Audio Tuner adds that switch."
      />

      <div className="mt-12 flex flex-col gap-6 text-base leading-relaxed text-muted-foreground">
        <p>
          Chrome asks once for microphone permission, and after that the only
          way to mute is the site&apos;s own button — buried in a settings menu,
          different on every site, and missing entirely from some. When you join
          a call late, scrambling to find it is the last thing you want.
        </p>

        <p>
          Audio Tuner puts a{" "}
          <strong className="text-foreground">per-tab mic switch</strong> in
          your toolbar. Flip it off and that tab can&apos;t hear you, regardless
          of what the site thinks. The mic stays blocked for that tab until you
          turn it back on.
        </p>

        <p>
          It&apos;s the meeting mute you actually wanted — one click in the
          toolbar, on every calling app, in the same place every time. Your
          other tabs keep their own settings.
        </p>

        <p>
          The toggle works alongside your system microphone. If the mic is on
          for the operating system, Audio Tuner decides{" "}
          <strong className="text-foreground">which tabs</strong> get to use it.
        </p>
      </div>
    </section>
  )
}

export { WhyMicSection }
