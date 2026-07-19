import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { TermsView } from "@/views/terms"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using Audio Tuner, a free, open-source per-tab media controller. Provided as-is; the mic and webcam toggles never record audio or video.",
  alternates: {
    canonical: pathsConfig.terms,
  },
}

export default function Page() {
  return <TermsView />
}
