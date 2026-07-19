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
    version: "1.1.0",
    date: "2026-07-19",
    changes: [
      {
        type: "added",
        text: "Per-tab mic toggle — mute any tab's microphone from the toolbar.",
      },
      {
        type: "added",
        text: "Per-tab webcam toggle — turn any tab's camera off from the toolbar.",
      },
      {
        type: "added",
        text: "True per-tab mute that silences one tab, not every tab on the same site like Chrome does.",
      },
      {
        type: "improved",
        text: "Audio Tuner is now a full per-tab media controller — volume, mic, and webcam.",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-01-15",
    changes: [
      {
        type: "added",
        text: "Initial public release of Audio Tuner — per-tab volume mixer for Chrome, Edge, and Brave.",
      },
      {
        type: "added",
        text: "Per-tab volume sliders from 0 to 400% using the Web Audio API.",
      },
      {
        type: "added",
        text: "Native per-tab mute, including WebRTC streams (Meet, Zoom web, Teams web).",
      },
      {
        type: "added",
        text: "Audible-only filter to focus on tabs currently making sound.",
      },
      {
        type: "added",
        text: "Boosted tabs glow amber so you can find them later.",
      },
      {
        type: "added",
        text: "Session-only storage — no servers, no analytics, no account.",
      },
    ],
  },
  {
    version: "0.9.0",
    date: "2025-12-10",
    changes: [
      {
        type: "improved",
        text: "Mixer popup now opens 40% faster on window sessions with many tabs.",
      },
      {
        type: "fixed",
        text: "Sliders no longer reset when a tab navigates to a new URL on the same origin.",
      },
      {
        type: "fixed",
        text: "Mute icon now correctly reflects state on Google Meet tabs after a refresh.",
      },
    ],
  },
  {
    version: "0.8.0",
    date: "2025-11-02",
    changes: [
      {
        type: "added",
        text: "Firefox build published alongside the Chromium build.",
      },
      {
        type: "improved",
        text: "Reduced extension bundle size by ~30% after switching to WXT.",
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
                  <span className="absolute top-1 -left-[5px] size-2 rounded-full bg-primary" />
                ) : (
                  <span className="absolute top-1 -left-[5px] size-2 rounded-full bg-border" />
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
