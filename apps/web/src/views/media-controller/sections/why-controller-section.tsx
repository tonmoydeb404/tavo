import { SectionHeading } from "@/views/home/components"

function WhyControllerSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="How it works"
        title="What a browser media controller actually does"
        description="A media controller puts every tab's sound, mic, and camera behind one set of per-tab switches — the controls Chrome forgot to give you."
      />

      <div className="mt-12 flex flex-col gap-6 text-base leading-relaxed text-muted-foreground">
        <p>
          Your browser plays audio, captures your mic, and reads your camera
          across dozens of tabs — and hands you almost no per-tab controls.
          Muting one YouTube tab silences them all; the only mic switch lives
          inside each calling app; the camera stays on until you find the
          site&apos;s hidden button.
        </p>

        <p>
          A <strong className="text-foreground">media controller</strong> fixes
          that. Audio Tuner gives every tab its own volume, mic, and camera
          settings, all in one popup in your toolbar.
        </p>

        <p>
          Volume runs through the{" "}
          <strong className="text-foreground">Web Audio API</strong>, so a quiet
          tab can be pushed past 100% up to 400% without touching anything else.
          Mic and camera toggles block that tab&apos;s access to your hardware,
          instantly, regardless of what the site expects.
        </p>

        <p>
          Nothing leaves your machine. There are no servers, no accounts, and no
          tracking — the controller is a set of local switches, full stop.
        </p>
      </div>
    </section>
  )
}

export { WhyControllerSection }
