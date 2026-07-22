import type { ReactNode } from "react"

import { faviconForTitle } from "@/assets"

import { FeatureScreenshotLayout } from "../components/feature-layout"
import { FeaturePopup, type FeatureRow } from "../components/feature-popup"

export type FeatureShotConfig = {
  id: string
  title: string
  subtitle: string
  filename: string
  badge: string
  headline: ReactNode
  copy: string
  pills: string[]
  rows: FeatureRow[]
}

const nextId = (() => {
  let n = 100
  return () => ++n
})()

const row = (
  partial: Partial<FeatureRow> & Pick<FeatureRow, "tab" | "state">
): FeatureRow => {
  const title = partial.tab.title ?? ""
  const favIconUrl =
    partial.tab.favIconUrl ?? faviconForTitle(title)
  return {
    activity: { hasMic: false, hasCamera: false },
    ...partial,
    tab: { id: nextId(), ...partial.tab, favIconUrl },
  }
}

export const featureShots: FeatureShotConfig[] = [
  {
    id: "volume-booster",
    title: "Volume booster",
    subtitle: "Feature screenshot · 1280×800",
    filename: "tavo-feature-volume-booster-1280x800.png",
    badge: "Volume booster",
    headline: (
      <>
        Boost any tab up to <span className="text-primary">400%</span>
      </>
    ),
    copy: "Quiet YouTube, muffled calls, inaudible podcasts — push past 100% with the Web Audio API. Per-tab, clean, instant.",
    pills: ["Web Audio API", "0–400% gain", "Amber boost glow", "Per-tab"],
    rows: [
      row({
        tab: { title: "youtube.com/watch", audible: true },
        state: { volume: 250, muted: false, micMuted: false, cameraOff: false },
        activity: { hasMic: false, hasCamera: false },
      }),
    ],
  },
  {
    id: "mute-tab",
    title: "Mute tab",
    subtitle: "Feature screenshot · 1280×800",
    filename: "tavo-feature-mute-tab-1280x800.png",
    badge: "Per-tab mute",
    headline: (
      <>
        Mute <span className="text-primary">one tab</span>, not the whole site
      </>
    ),
    copy: "Silence the autoplaying ad, the background news, the loud tab — without pausing or closing it. Every other tab keeps its audio.",
    pills: ["Per-tab mute", "Keeps position", "Works on WebRTC", "One click"],
    rows: [
      row({
        tab: { title: "meet.google.com", audible: true },
        state: { volume: 100, muted: true, micMuted: false, cameraOff: false },
      }),
      row({
        tab: { title: "meet.google.com", audible: true },
        state: { volume: 80, muted: false, micMuted: false, cameraOff: false },
      }),
    ],
  },
  {
    id: "mic-toggle",
    title: "Mic toggle",
    subtitle: "Feature screenshot · 1280×800",
    filename: "tavo-feature-mic-toggle-1280x800.png",
    badge: "Per-tab mic switch",
    headline: (
      <>
        Kill your <span className="text-primary">mic</span> from the toolbar
      </>
    ),
    copy: "One switch for every calling app — Meet, Zoom, Teams. The site can't hear you until you flip it back.",
    pills: ["Per-tab", "Meet · Zoom · Teams", "Stays off", "One click"],
    rows: [
      row({
        tab: { title: "meet.google.com", active: true },
        state: { volume: 120, muted: false, micMuted: true, cameraOff: false },
        activity: { hasMic: true, hasCamera: true },
      }),
    ],
  },
  {
    id: "webcam-toggle",
    title: "Webcam toggle",
    subtitle: "Feature screenshot · 1280×800",
    filename: "tavo-feature-webcam-toggle-1280x800.png",
    badge: "Per-tab camera switch",
    headline: (
      <>
        Kill the <span className="text-primary">camera</span> from the toolbar
      </>
    ),
    copy: "A lens cap for any site. Flip it off and the feed stops, on any site, without digging through its UI.",
    pills: ["Per-tab", "Any site", "Stays off", "One click"],
    rows: [
      row({
        tab: { title: "meet.google.com", active: true },
        state: { volume: 120, muted: false, micMuted: false, cameraOff: true },
        activity: { hasMic: true, hasCamera: true },
      }),
    ],
  },
  {
    id: "media-controller",
    title: "Media controller",
    subtitle: "Feature screenshot · 1280×800",
    filename: "tavo-feature-media-controller-1280x800.png",
    badge: "Media controller",
    headline: (
      <>
        Every tab. <span className="text-primary">One popup.</span>
      </>
    ),
    copy: "Volume, mute, mic, and camera — per tab, in one toolbar popup. The audio mixer Chrome forgot to ship.",
    pills: ["Volume", "Mute", "Mic", "Webcam", "Per-tab"],
    rows: [
      row({
        tab: { title: "youtube.com/watch", audible: true },
        state: { volume: 50, muted: false, micMuted: false, cameraOff: false },
      }),
      row({
        tab: { title: "meet.google.com", active: true },
        state: { volume: 150, muted: false, micMuted: true, cameraOff: true },
        activity: { hasMic: true, hasCamera: true },
      }),
    ],
  },
]

function FeatureShot({ config }: { config: FeatureShotConfig }) {
  return (
    <FeatureScreenshotLayout
      badge={config.badge}
      headline={config.headline}
      copy={config.copy}
      pills={config.pills}
      popup={<FeaturePopup rows={config.rows} />}
    />
  )
}

export { FeatureShot }
