import { SectionHeading } from "@/views/home/components"

function WhyBoosterSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="How it works"
        title="What a volume booster actually does"
        description="Your operating system caps every tab at 100% of its original loudness. A volume booster removes that ceiling for any individual tab."
      />

      <div className="mt-12 flex flex-col gap-6 text-base leading-relaxed text-muted-foreground">
        <p>
          A <strong className="text-foreground">volume booster</strong> is a
          browser extension that amplifies the audio of any tab beyond the
          maximum your operating system allows. When a YouTube video is mixed
          too quietly, or a video call comes in muffled, your laptop speakers
          have no headroom left — even at 100% system volume, the sound is
          barely audible.
        </p>

        <p>
          Audio Tuner solves this with the{" "}
          <strong className="text-foreground">Web Audio API</strong>. Every tab
          you boost gets its own audio graph with a{" "}
          <strong className="text-foreground">gain node</strong> — a real-time
          amplifier running inside the browser. The gain node multiplies the
          incoming signal up to 4× (400%), so the same speakers that were too
          quiet at 100% suddenly have plenty of headroom.
        </p>

        <p>
          This is per-tab amplification. Your music stays at its original level
          while a quiet meeting gets boosted; a podcast gets louder without
          touching the video you have muted in another window. There is no
          system-wide EQ, no driver, and no other app involved.
        </p>

        <p>
          At extreme boosts (above ~250%) you may hear mild distortion on
          already-loud sources — Audio Tuner marks boosted tabs in amber so you
          can dial them back. For everyday cases like quiet YouTube, Netflix,
          Spotify, or Google Meet, the boost is clean and immediate.
        </p>
      </div>
    </section>
  )
}

export { WhyBoosterSection }
