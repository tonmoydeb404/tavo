import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { FaqView } from "@/views/faq"

const title = "FAQ — Audio Tuner Questions, Answered"
const description =
  "Common questions about Audio Tuner — per-tab volume and boost, mic mute, webcam toggle, privacy, and supported browsers. Plain answers, no jargon."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.faq,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.faq,
  },
}

export default function Page() {
  return <FaqView />
}
