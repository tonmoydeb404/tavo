import { IconBrandChrome, IconMessageQuestion } from "@tabler/icons-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import Link from "next/link"

import { HeroSection } from "@/components/sections"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { Fragment } from "react"

type Faq = { question: string; answer: string }
type FaqGroup = { category: string; items: Faq[] }

const groups: FaqGroup[] = [
  {
    category: "General",
    items: [
      {
        question: "What is Audio Tuner?",
        answer:
          "A free browser extension that puts per-tab controls for volume, your microphone, and your webcam in one toolbar popup. Mute and boost any tab's volume, and flip your mic or camera off, one tab at a time.",
      },
      {
        question: "Is Audio Tuner free?",
        answer:
          "Yes. No account, no trial, no paid tier. Every feature — volume, boost, mic, and camera — is free.",
      },
      {
        question: "Which browsers does it work on?",
        answer:
          "Chrome, Edge, Brave, and other Chromium browsers. A separate Firefox build is also available.",
      },
    ],
  },
  {
    category: "Volume & boost",
    items: [
      {
        question: "What does boosting past 100% actually do?",
        answer:
          "It makes a tab louder than your system's maximum, using the browser's Web Audio API. Quiet dialogue becomes audible on laptop speakers. Push it too far (above ~250% on loud sources) and it may distort — boosted tabs glow amber so you can dial it back.",
      },
      {
        question: "How loud can a tab go?",
        answer: "Up to 400% — a 4× boost over the original level.",
      },
      {
        question: "Does it work on YouTube, Netflix, and Spotify?",
        answer:
          "Yes. Any tab that plays audio can be muted or boosted, including YouTube, Netflix, Spotify web, Twitch, and Meet. Some DRM-protected streams may limit boost; mute always works.",
      },
    ],
  },
  {
    category: "Mute",
    items: [
      {
        question: "Doesn't Chrome already let me mute a tab?",
        answer:
          "Chrome's built-in mute silences every tab on the same site at once. Audio Tuner mutes one tab at a time, so you can hush a single noisy YouTube tab without killing the music in the one next to it.",
      },
      {
        question:
          "What's the difference between muting a tab and the mic toggle?",
        answer:
          "Muting a tab silences what you hear coming out of it. The mic toggle is separate — it blocks that tab from capturing your microphone. Use mute for loud audio, the mic toggle when you want to stop a tab hearing you.",
      },
    ],
  },
  {
    category: "Microphone & webcam",
    items: [
      {
        question: "How do the mic and webcam toggles work?",
        answer:
          "Each toggle turns that tab's access to your mic or camera on or off, right from the popup. Audio Tuner itself never records, stores, or transmits mic audio or camera video — it's a local on/off switch for the tab's permission.",
      },
      {
        question:
          "Can I keep the mic or camera on for one tab and off for another?",
        answer:
          "Yes. Both toggles are per tab, so your Meet camera can stay on while every other tab is blocked.",
      },
      {
        question: "Does it work with Google Meet, Zoom, and Teams?",
        answer:
          "Yes. Mute, boost, mic, and camera controls all work on call tabs. Some protected streams may limit volume boost, but the mic and webcam toggles apply cleanly.",
      },
    ],
  },
  {
    category: "Privacy & data",
    items: [
      {
        question: "Is my data collected?",
        answer:
          "No. Audio Tuner has no servers, no analytics, and no account. Per-tab settings live only in your browser's session storage and are wiped when you close it.",
      },
      {
        question: "Where are my settings stored?",
        answer:
          "In the browser's session storage, locally on your device. Nothing is synced to the cloud or sent anywhere.",
      },
      {
        question: "Can I use it in incognito mode?",
        answer:
          "Yes, after you explicitly allow it. Open chrome://extensions, click Details on Audio Tuner, and toggle Allow in incognito.",
      },
    ],
  },
]

const allFaqs = groups.flatMap((group) => group.items)

function FaqView() {
  return (
    <>
      <HeroSection
        badgeIcon={IconMessageQuestion}
        badgeText="FAQ"
        title="Frequently asked questions"
        description="Everything you might want to know about Audio Tuner — volume, boost, mic, webcam, and privacy. Skip to a category below."
        primaryCta={{
          href: siteConfig.links.chromeStore,
          label: "Add to Chrome — free",
          icon: IconBrandChrome,
        }}
        secondaryCta={{
          href: pathsConfig.features,
          label: "Browse features",
        }}
      >
        <div className="flex flex-wrap gap-2 pt-2 text-sm">
          {groups.map((group) => (
            <Fragment key={group.category}>
              <Link
                href={`#${group.category}`}
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {group.category}
              </Link>

              <span className="text-muted-foreground/40">·</span>
            </Fragment>
          ))}
        </div>
      </HeroSection>
      <main className="container py-20">
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <section
              key={group.category}
              id={group.category}
              className="flex scroll-mt-24 flex-col gap-4"
            >
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {group.category}
              </h2>
              <Accordion>
                {group.items.map((faq, index) => (
                  <AccordionItem
                    key={faq.question}
                    value={`${group.category}-${index}`}
                  >
                    <AccordionTrigger className="text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}

          <section className="flex flex-col items-start gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Still have questions?
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Browse the full{" "}
              <Link
                href={pathsConfig.features}
                className="text-foreground underline underline-offset-4"
              >
                feature list
              </Link>
              , or reach me at{" "}
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
    </>
  )
}

export { allFaqs as faqs, FaqView }
