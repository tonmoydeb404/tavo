import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  webApplicationSchema,
} from "@/seo"
import { MicToggleView } from "@/views/mic-toggle"
import { faqs } from "@/views/mic-toggle/sections"

const title = "Mic Muter for Chrome — Mute Your Microphone Per Tab"
const description =
  "Free Chrome mic toggle. Mute your mic in Google Meet, Zoom, and Teams from the toolbar — no hunting for the in-call mute button. Per-tab, no account, no tracking. Works on Chrome, Edge, and Brave."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.micToggle,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.micToggle,
  },
}

export default function Page() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.micToggle}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Mic Muter",
      url,
      description:
        "Per-tab microphone mute for Chrome, Edge, and Brave. Toggle your mic off in any tab from the toolbar, without digging through each site's settings.",
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Mic Toggle", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}
      <MicToggleView />
    </>
  )
}
