import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { ChangelogView } from "@/views/changelog"

const title = "Changelog — Audio Tuner"
const description =
  "What's new in Audio Tuner. Version history with features, fixes, and improvements for every release."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.changelog,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.changelog,
  },
}

export default function Page() {
  return <ChangelogView />
}
