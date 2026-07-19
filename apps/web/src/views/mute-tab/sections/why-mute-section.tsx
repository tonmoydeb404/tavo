import { SectionHeading } from "@/views/home/components"

function WhyMuteSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="How it works"
        title="What per-tab muting actually does"
        description="Chrome's built-in mute is all-or-nothing. A per-tab mute button gives you silence exactly where you want it."
      />

      <div className="mt-12 flex flex-col gap-6 text-base leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Muting a tab</strong> silences all
          audio coming from that single browser tab — instantly, and without
          pausing the video or stream that is playing. The tab keeps running in
          the background, your position in a YouTube video is preserved, and
          every other tab keeps its audio as it was.
        </p>

        <p>
          Chrome does ship a basic mute option on the tab context menu, but it
          is hidden, fiddly on a trackpad, and gets reset whenever a site
          re-grabs audio. Audio Tuner exposes a{" "}
          <strong className="text-foreground">
            dedicated mute button per tab
          </strong>{" "}
          inside a small popup mixer. One click on the speaker icon and that tab
          is silent — including WebRTC streams like Google Meet, Zoom web, and
          Teams web.
        </p>

        <p>
          Because mute is applied through the browser&apos;s native tab-mute
          API, it costs nothing in CPU and works the instant a tab starts making
          sound. Combine it with the volume booster on other tabs and you have a
          real audio mixer for your browser.
        </p>

        <p>
          Common reasons people reach for per-tab mute: silencing the
          autoplaying news site you opened in a background tab, quieting the ad
          that is 3× louder than the show you were watching, or hitting mute on
          a meeting while you take a side call.
        </p>
      </div>
    </section>
  )
}

export { WhyMuteSection }
