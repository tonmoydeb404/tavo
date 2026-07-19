import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { WebcamToggleView } from "@/views/webcam-toggle"

const title = "Webcam Toggle for Chrome — Turn Off Any Tab's Camera"
const description =
  "Free Chrome webcam toggle. Turn off a tab's camera from the toolbar — no clicking through the site to find its camera button. Per-tab, no account, no tracking. Works on Chrome, Edge, and Brave."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.webcamToggle,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.webcamToggle,
  },
}

export default function Page() {
  return <WebcamToggleView />
}
