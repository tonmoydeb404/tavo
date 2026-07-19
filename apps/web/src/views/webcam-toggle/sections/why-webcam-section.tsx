import { SectionHeading } from "@/views/home/components"

function WhyWebcamSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="How it works"
        title="Why a per-tab webcam toggle matters"
        description="Most sites can reach your camera after one permission prompt and give you no easy way to take it back per tab. Audio Tuner adds that switch."
      />

      <div className="mt-12 flex flex-col gap-6 text-base leading-relaxed text-muted-foreground">
        <p>
          Chrome hands out camera access per site, then leaves you to find each
          site&apos;s camera button — if it has one. Plenty of sites keep your
          camera live with no obvious off switch, and some never ask again after
          the first yes.
        </p>

        <p>
          Audio Tuner puts a{" "}
          <strong className="text-foreground">per-tab camera toggle</strong> in
          your toolbar. Flip it off and that tab&apos;s camera feed stops, on
          any site, without you digging through its UI. It stays off for that
          tab until you turn it back on.
        </p>

        <p>
          It&apos;s the lens cap you didn&apos;t get — one click in the toolbar,
          every time, whether it&apos;s a meeting, a proctoring tool, or a chat
          site that defaulted to video.
        </p>

        <p>
          The toggle works alongside your operating system&apos;s camera
          privacy setting. If the OS camera is on, Audio Tuner decides{" "}
          <strong className="text-foreground">which tabs</strong> get to use it.
        </p>
      </div>
    </section>
  )
}

export { WhyWebcamSection }
