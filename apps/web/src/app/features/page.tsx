import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { FeaturesView } from "@/views/features"

const title = "Features — Volume, Mic & Webcam per Tab"
const description =
  "See everything Audio Tuner controls — per-tab volume and boost up to 400%, a mic mute, and a webcam toggle, all from one toolbar popup. Free, for Chrome, Edge, and Brave."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.features,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.features,
  },
}

export default function Page() {
  return <FeaturesView />
}
