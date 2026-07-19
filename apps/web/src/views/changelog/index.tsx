import {
  IconAlertTriangle,
  IconCircleCheck,
  IconHistory,
  IconStar,
} from "@tabler/icons-react"
import type { ComponentType } from "react"

import { HeroSection } from "@/components/sections"
import { siteConfig } from "@/configs/site-config"

type ChangeType = "added" | "improved" | "fixed"

type Change = {
  type: ChangeType
  text: string
}

type Release = {
  version: string
  date: string
  changes: Change[]
}

const releases: Release[] = [
  {
    version: "1.0.0",
    date: "2026-07-20",
    changes: [
      {
        type: "added",
        text: "Initial public release of Audio Tuner — a per-tab media controller for Chromium browsers (Chrome, Edge, Brave).",
      },
      {
        type: "added",
        text: "Per-tab volume sliders from 0 to 400% using the Web Audio API, applied directly in each page's audio context.",
      },
      {
        type: "added",
        text: "Native per-tab mute via chrome.tabs.update({ muted }) — silences one tab without affecting other tabs on the same site, including WebRTC streams (Meet, Zoom web, Teams web).",
      },
      {
        type: "added",
        text: "Per-tab microphone toggle to mute any tab's mic from the toolbar.",
      },
      {
        type: "added",
        text: "Per-tab webcam toggle to turn any tab's camera off from the toolbar.",
      },
      {
        type: "added",
        text: "Audible-only filter so you can focus on tabs currently making sound.",
      },
      {
        type: "added",
        text: "Per-tab badge counter showing how many adjustments (volume, mute, mic, camera) are active on each tab, without opening the popup.",
      },
      {
        type: "added",
        text: "Session-only storage via chrome.storage.session — no servers, no analytics, no account, no data leaving the browser.",
      },
    ],
  },
]

const changeMeta: Record<
  ChangeType,
  { label: string; icon: ComponentType<{ className?: string }>; color: string }
> = {
  added: { label: "Added", icon: IconStar, color: "text-primary" },
  improved: {
    label: "Improved",
    icon: IconCircleCheck,
    color: "text-emerald-600",
  },
  fixed: { label: "Fixed", icon: IconAlertTriangle, color: "text-amber-600" },
}

function ChangelogView() {
  return (
    <>
      <HeroSection
        badgeIcon={IconHistory}
        badgeText="Changelog"
        title="Changelog"
        description={`What's new in ${siteConfig.brand.name}. Every release — features, improvements, and fixes.`}
      />
      <main className="container py-20">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-10">
            {releases.map((release, index) => (
              <article
                key={release.version}
                className="relative flex flex-col gap-4 border-l-2 border-border pl-6"
              >
                {index === 0 ? (
                  <span className="absolute top-1 -left-1.25 size-2 rounded-full bg-primary" />
                ) : (
                  <span className="absolute top-1 -left-1.25 size-2 rounded-full bg-border" />
                )}

                <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight">
                    v{release.version}
                  </h2>
                  <time
                    dateTime={release.date}
                    className="text-sm text-muted-foreground"
                  >
                    {new Date(release.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  {index === 0 ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Latest
                    </span>
                  ) : null}
                </header>

                <ul className="flex flex-col gap-2">
                  {release.changes.map((change, changeIndex) => {
                    const entry = changeMeta[change.type]
                    return (
                      <li
                        key={changeIndex}
                        className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center ${entry.color}`}
                        >
                          <entry.icon className="size-4" />
                        </span>
                        <span>
                          <strong className="font-medium text-foreground">
                            {entry.label}:
                          </strong>{" "}
                          {change.text}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export { ChangelogView }
