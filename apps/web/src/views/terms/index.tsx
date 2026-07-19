import { siteConfig } from "@/configs/site-config"

type Section = {
  heading: string
  body?: string[]
  bullets?: string[]
}

const lastUpdated = "July 19, 2026"

const sections: Section[] = [
  {
    heading: "The short version",
    bullets: [
      "Audio Tuner is free and provided 'as is', with no warranty.",
      "It doesn't record your mic or camera — the toggles only switch a tab's access on or off.",
      "You're responsible for how you use it, including following local recording and consent laws.",
      "You can stop using it or uninstall it at any time.",
    ],
  },
  {
    heading: "Agreement and what Audio Tuner is",
    body: [
      "By installing or using Audio Tuner, you agree to these Terms. Audio Tuner is a free, open-source browser extension that adds per-tab controls for volume, your microphone, and your webcam. If you don't agree to these Terms, don't install or use it.",
    ],
  },
  {
    heading: "Free, open source, and licensing",
    body: [
      "Audio Tuner is open source. You can read the code, audit it, and build it yourself. The source is licensed under the terms in its repository on GitHub. These Terms give you permission to use the extension; they don't transfer ownership of the Audio Tuner name, logo, or other trademarks.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "You agree to use Audio Tuner for its intended purpose — controlling media in your own browser tabs. You won't misuse it, distribute a modified version under the Audio Tuner name, or use it to interfere with other people's systems.",
      "You're responsible for your own use. Some places have laws about recording audio or video, or about who needs to consent. Audio Tuner itself doesn't record anything, but you're responsible for following those laws when using other software alongside it.",
    ],
  },
  {
    heading: "Microphone, camera, and recording",
    body: [
      "Audio Tuner's microphone and webcam toggles only turn a tab's access to those devices on or off. They don't record, capture, or transmit anything. If recording happens, it's done by the site or app you're using — not by Audio Tuner. You're responsible for complying with any consent and recording laws that apply to your situation.",
    ],
  },
  {
    heading: "Disclaimers",
    body: [
      "Audio Tuner is provided 'as is' and 'as available', without warranties of any kind. Volume boost may cause distortion at high levels, and per-tab mic and camera behavior can be limited by a site's own controls or by your browser.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "To the fullest extent permitted by law, we aren't liable for damages arising from your use of Audio Tuner. The extension is free, and you use it at your own discretion.",
    ],
  },
  {
    heading: "Termination",
    body: [
      "You can stop using Audio Tuner and uninstall it at any time. Uninstalling removes the extension and its local settings. The open-source license for the code continues to apply to any copies of the source.",
    ],
  },
  {
    heading: "Changes to these Terms",
    body: [
      "We may update these Terms. Continued use after changes are posted here counts as acceptance of the updated Terms.",
    ],
  },
]

export const TermsView = () => {
  return (
    <main className="container py-20">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {section.heading}
            </h2>
            {section.body?.map((paragraph, index) => (
              <p key={index} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
                {section.bullets.map((bullet, index) => (
                  <li key={index} className="leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
          <p className="leading-relaxed text-muted-foreground">
            If you have questions about these Terms of Service, contact us at{" "}
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="text-foreground underline underline-offset-4"
            >
              {siteConfig.links.email}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
