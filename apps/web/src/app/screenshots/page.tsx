import type { Metadata } from "next"

import { ScreenshotsView } from "@/views/screenshots"

export const metadata: Metadata = {
  title: "Store Screenshots",
  description:
    "Chrome Web Store promotional assets for Tavo — 1280x800, 440x280, and 1400x560. Export as PNG.",
  robots: { index: false, follow: false },
}

export default function Page() {
  return <ScreenshotsView />
}
