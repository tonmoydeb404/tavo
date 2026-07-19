import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { PrivacyView } from "@/views/privacy"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Audio Tuner handles your information. No account, no analytics, no servers — per-tab settings live only in your browser. Microphone and camera toggles never record or transmit.",
  alternates: {
    canonical: pathsConfig.privacy,
  },
}

export default function Page() {
  return <PrivacyView />
}
