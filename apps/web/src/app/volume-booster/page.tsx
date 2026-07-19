import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { VolumeBoosterView } from "@/views/volume-booster"

const title = "Volume Booster for Chrome — Boost Any Tab Up to 400%"
const description =
  "Free Chrome volume booster. Make quiet YouTube, Netflix, Spotify, and Meet tabs up to 400% louder with per-tab control. No account, no tracking. Works on Chrome, Edge, and Brave."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.volumeBooster,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.volumeBooster,
  },
}

export default function Page() {
  return <VolumeBoosterView />
}
