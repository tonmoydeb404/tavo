import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { MuteTabView } from "@/views/mute-tab"

const title = "Mute Any Tab in Chrome — Per-Tab Mute Control"
const description =
  "Mute any tab in Chrome, Edge, or Brave without pausing playback. Silence autoplay ads, noisy tabs, and background video instantly with Audio Tuner."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.muteTab,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.muteTab,
  },
}

export default function Page() {
  return <MuteTabView />
}
