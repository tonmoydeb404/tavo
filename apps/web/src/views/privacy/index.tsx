import { IconShieldLock } from "@tabler/icons-react"
import Link from "next/link"

import { HeroSection } from "@/components/sections"
import { pathsConfig } from "@/configs/path-config"
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
      "No account, no email, no sign-up.",
      "No analytics, telemetry, or tracking in the extension.",
      "No servers — the extension has nowhere to send your data.",
      "Microphone and camera toggles only switch a tab's access on or off. Audio Tuner never records, listens to, or transmits your mic or camera.",
      "Per-tab settings live in session storage and are cleared when you close the browser.",
    ],
  },
  {
    heading: "What Audio Tuner is",
    body: [
      "Audio Tuner is a per-tab media controller. It adjusts volume, mutes tabs, and toggles your microphone and webcam for individual browser tabs. This policy explains what the extension and its website do with your information.",
    ],
  },
  {
    heading: "Information I collect",
    body: [
      "I don't collect personal information through the extension. I don't add accounts, analytics SDKs, or tracking pixels to it, and there is no backend for the extension to talk to.",
      "This website doesn't require an account either. If I add basic, privacy-friendly analytics in the future, this page will say so and name the tool.",
    ],
  },
  {
    heading: "Microphone, camera, and audio",
    body: [
      "To control a tab's volume, Audio Tuner processes that tab's audio locally with the browser's Web Audio API. The audio stays inside your browser — it is never recorded or sent anywhere.",
      "To toggle your microphone or webcam per tab, Audio Tuner controls whether that individual tab is allowed to reach those devices. It's an on/off switch for a tab's permission, nothing more. Audio Tuner itself never captures, records, stores, or transmits microphone audio or camera video.",
      "When a mic or camera toggle is off, the tab can't reach that device. When it's on, the tab uses the device directly, exactly as it would without Audio Tuner installed.",
    ],
  },
  {
    heading: "Permissions the extension requests",
    body: [
      "Audio Tuner asks for the permissions it needs to work, and no others:",
    ],
    bullets: [
      "Tab audio access — to show per-tab volume sliders and apply boost and mute.",
      "Microphone and camera management — to turn each on or off per tab on your request.",
      "Storage — to remember your per-tab settings for the current session.",
    ],
  },
  {
    heading: "Where settings are stored",
    body: [
      "Your per-tab volume, mute, mic, and camera settings are stored in the browser's session storage. They live only on your device and are cleared when you close the browser. Nothing about your settings is sent to me.",
    ],
  },
  {
    heading: "Cookies and the website",
    body: [
      "This website doesn't use tracking or advertising cookies. Standard web infrastructure may set essential cookies needed to serve the pages. I don't run third-party analytics or ad networks on the site.",
    ],
  },
  {
    heading: "Third-party services",
    body: [
      "The extension itself uses no third-party services. The website is hosted on a standard web host, which may keep basic server logs as part of keeping the site online. Installing Audio Tuner happens through your browser's extension store, which has its own terms and privacy practices.",
    ],
  },
  {
    heading: "Data retention",
    body: [
      "There's nothing to retain. The extension stores your settings only for the current session, and they're wiped when the browser closes. With no server, there's no long-term storage on my side.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Because I don't collect or store personal information about you, there's no data of yours for me to access, export, or delete. You're always in control: closing the browser clears your session settings, and removing the extension clears everything. If you have a specific request, contact me and I'll help.",
    ],
  },
  {
    heading: "Children",
    body: [
      "Audio Tuner isn't directed at children, and I don't knowingly collect information from anyone under 16. The extension doesn't collect information from anyone at all.",
    ],
  },
  {
    heading: "Changes to this policy",
    body: [
      "If I change this policy, I'll post the updated version here with a new last-updated date.",
    ],
  },
]

export const PrivacyView = () => {
  return (
    <>
      <HeroSection
        badgeIcon={IconShieldLock}
        badgeText="Privacy"
        title="Privacy Policy"
        description="How Audio Tuner handles your data. The short version: it doesn't. No account, no analytics, no servers — per-tab settings live only in your browser's session storage."
      >
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>Last updated: {lastUpdated}</span>
          <span aria-hidden="true">·</span>
          <Link
            href={pathsConfig.terms}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Terms of Service
          </Link>
          <span aria-hidden="true">·</span>
          <a
            href={`mailto:${siteConfig.links.email}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Contact
          </a>
        </div>
      </HeroSection>
      <main className="container py-20">
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              {section.body?.map((paragraph, index) => (
                <p
                  key={index}
                  className="leading-relaxed text-muted-foreground"
                >
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
              If you have questions about this Privacy Policy, contact me at{" "}
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
