import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { JsonLd, faqPageSchema } from "@/seo"
import { faqs, HelpView } from "@/views/help"

const title = "Help & Docs — Audio Tuner"
const description =
  "How to install, pin, and use Audio Tuner's per-tab media controller — volume, mic, and webcam. Quick-start guide, controls reference, and troubleshooting."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.help,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.help,
  },
}

export default function Page() {
  return (
    <>
      <JsonLd schema={faqPageSchema(faqs)} />
      <HelpView />
    </>
  )
}
