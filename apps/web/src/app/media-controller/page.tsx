import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { MediaControllerView } from "@/views/media-controller"

const title = "Media Controller for Chrome — Volume, Mic & Webcam Per Tab"
const description =
  "A per-tab media controller for Chrome. Mute and boost any tab's volume to 400%, toggle your mic and webcam, one tab at a time. Free, no account, no tracking. Works on Chrome, Edge, and Brave."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.mediaController,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.mediaController,
  },
}

export default function Page() {
  return <MediaControllerView />
}
