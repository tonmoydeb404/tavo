import {
  IconAdjustments,
  IconAlertCircle,
  IconDownload,
  IconLifebuoy,
  IconMicrophone,
  IconPin,
  IconVideo,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"
import Link from "next/link"
import { Fragment, type ComponentType } from "react"

import { HeroSection } from "@/components/sections"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type Step = {
  icon: ComponentType<{ className?: string }>
  title: string
  body: string
}

const setupSteps: Step[] = [
  {
    icon: IconDownload,
    title: "1. Install from the Chrome Web Store",
    body: "Open the listing on the Chrome Web Store and click Add to Chrome. The same listing installs cleanly on Edge and Brave. Audio Tuner does not request any sensitive permissions.",
  },
  {
    icon: IconPin,
    title: "2. Pin Audio Tuner to the toolbar",
    body: "Click the puzzle-piece icon in the top-right of your browser, find Audio Tuner in the list, and click the pin icon. The Audio Tuner logo now lives in your toolbar for one-click access.",
  },
  {
    icon: IconAdjustments,
    title: "3. Open the controller",
    body: "Click the pinned Audio Tuner icon. The popup lists every open tab — drag any slider to set volume, click the speaker to mute, flip the mic or camera toggle, and watch the boosted tabs glow amber.",
  },
]

const controls: Step[] = [
  {
    icon: IconVolume,
    title: "Volume slider (0–400%)",
    body: "Drag a tab’s slider left or right. 100% is the original level, 0% is fully silent, 400% is a 4× boost. Boosted tabs glow amber so you can find them later.",
  },
  {
    icon: IconVolumeOff,
    title: "Per-tab mute",
    body: "Click the speaker icon to mute just that one tab — unlike Chrome’s built-in mute, it won’t silence every other tab on the same site. Works on WebRTC streams like Meet or Zoom web.",
  },
  {
    icon: IconMicrophone,
    title: "Mic toggle",
    body: "Flip the mic icon on any tab to block that tab from your microphone. Other tabs keep their own setting — handy for keeping one call live while silencing another.",
  },
  {
    icon: IconVideo,
    title: "Webcam toggle",
    body: "Flip the camera icon on any tab to turn that tab’s webcam off from the toolbar — no clicking through the site to find its camera button.",
  },
  {
    icon: IconAdjustments,
    title: "Show audible tabs only",
    body: "Toggle the filter in the popup to show only tabs currently making sound, or every tab you have open. Useful on busy window sessions.",
  },
]

const troubleshooting: Step[] = [
  {
    icon: IconAlertCircle,
    title: "A tab is not showing up",
    body: "Audio Tuner only sees tabs in the current window that have finished loading. Refresh the page, or close and reopen the popup. Tabs in incognito are not visible unless you allow the extension in incognito mode.",
  },
  {
    icon: IconAlertCircle,
    title: "Boost sounds distorted",
    body: "Above about 250% on already-loud sources, software amplification can clip. Lower the slider on that tab, or lower your system volume so the boost has more headroom.",
  },
  {
    icon: IconAlertCircle,
    title: "Audio on a protected site does not boost",
    body: "Some DRM-protected streams (certain Netflix titles, some live TV) route audio in a way the Web Audio API cannot intercept. Mute still works; boost may be limited by the site itself.",
  },
  {
    icon: IconAlertCircle,
    title: "A site says my mic or camera is blocked",
    body: "If a tab can’t reach your mic or webcam, you probably toggled it off in Audio Tuner. Open the popup and flip the mic or camera toggle for that tab back on. Other tabs aren’t affected.",
  },
]

type Faq = { question: string; answer: string }

const faqs: Faq[] = [
  {
    question:
      "Does Audio Tuner work on Edge, Brave, and other Chromium browsers?",
    answer:
      "Yes. Audio Tuner is a Manifest V3 extension and works in any Chromium browser, including Chrome, Edge, Brave, Vivaldi, and Arc. A separate Firefox build is also available.",
  },
  {
    question: "Does Audio Tuner collect any data?",
    answer:
      "No. Audio Tuner has no servers and no analytics. Your per-tab settings are stored locally in session storage and removed when you close the browser. Read the privacy policy for the details.",
  },
  {
    question: "Why does a boosted tab sound distorted?",
    answer:
      "Software amplification past 100% multiplies the signal; on already-loud sources this can cause clipping (distortion). Lower the boost on that tab, or reduce your system volume so the boost has headroom to work in.",
  },
  {
    question: "Can I use Audio Tuner in incognito mode?",
    answer:
      "Yes, after you explicitly allow it. Open chrome://extensions, click Details on Audio Tuner, and toggle Allow in incognito. Audio Tuner will then appear in incognito windows too.",
  },
  {
    question: "What’s the difference between muting a tab and the mic toggle?",
    answer:
      "Per-tab mute silences what you hear coming out of that tab — it doesn’t affect your microphone. The mic toggle is separate: it blocks that tab from capturing your microphone. Use mute for loud audio, the mic toggle when you want to stop a tab hearing you.",
  },
  {
    question: "Where do I report a bug or request a feature?",
    answer:
      "Open an issue on the GitHub repository. I read every issue, though I cannot promise a timeline on fixes or new features.",
  },
]

const links: { label: string; href: string }[] = [
  {
    label: "Install",
    href: "#install",
  },
  {
    label: "Controls",
    href: "#controls",
  },
  {
    label: "Troubleshooting",
    href: "#troubleshooting",
  },
  {
    label: "FAQ",
    href: "#faq",
  },
]

function HelpView() {
  return (
    <>
      <HeroSection
        badgeIcon={IconLifebuoy}
        badgeText="Help"
        title={`${siteConfig.brand.name} Help`}
        description="Everything you need to install, pin, and use the per-tab media controller — volume, mic, and webcam. Skip ahead with the links below."
      >
        <div className="flex flex-wrap gap-2 pt-2 text-sm">
          {links.map((link) => (
            <Fragment key={link.label}>
              <Link
                href={link.href}
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {link.label}
              </Link>
              <span className="text-muted-foreground/40">·</span>
            </Fragment>
          ))}
        </div>
      </HeroSection>
      <main className="container py-20">
        <div className="flex flex-col gap-12">
          <section id="install" className="flex scroll-mt-24 flex-col gap-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Getting started
            </h2>
            <div className="flex flex-col gap-5">
              {setupSteps.map((step) => (
                <div
                  key={step.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 sm:flex-row"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-heading text-lg font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="controls" className="flex scroll-mt-24 flex-col gap-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Controller controls
            </h2>
            <div className="flex flex-col gap-5">
              {controls.map((control) => (
                <div
                  key={control.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 sm:flex-row"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <control.icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-heading text-lg font-semibold tracking-tight">
                      {control.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {control.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            id="troubleshooting"
            className="flex scroll-mt-24 flex-col gap-6"
          >
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Troubleshooting
            </h2>
            <div className="flex flex-col gap-5">
              {troubleshooting.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 sm:flex-row"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-heading text-lg font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="faq" className="flex scroll-mt-24 flex-col gap-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
            <div className="flex flex-col gap-5">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-6"
                >
                  <h3 className="font-heading text-base font-semibold tracking-tight">
                    {faq.question}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-start gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Still need help?
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open an issue on{" "}
              <Link
                href={siteConfig.links.github}
                className="text-foreground underline underline-offset-4"
              >
                GitHub
              </Link>{" "}
              or email{" "}
              <a
                href={`mailto:${siteConfig.links.email}`}
                className="text-foreground underline underline-offset-4"
              >
                {siteConfig.links.email}
              </a>
              .
            </p>
            <Link
              href={pathsConfig.mediaController}
              className={cn(buttonVariants())}
            >
              <IconDownload className="size-4" />
              Get Audio Tuner
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}

export { faqs, HelpView }
