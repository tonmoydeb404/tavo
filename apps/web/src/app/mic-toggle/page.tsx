import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { MicToggleView } from "@/views/mic-toggle"

const title = "Mic Muter for Chrome — Mute Your Microphone Per Tab"
const description =
  "Free Chrome mic toggle. Mute your mic in Google Meet, Zoom, and Teams from the toolbar — no hunting for the in-call mute button. Per-tab, no account, no tracking. Works on Chrome, Edge, and Brave."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.micToggle,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.micToggle,
  },
}

export default function Page() {
  return <MicToggleView />
}
