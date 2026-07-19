import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  webApplicationSchema,
} from "@/seo"
import { MuteTabView } from "@/views/mute-tab"
import { faqs } from "@/views/mute-tab/sections"

const title = "Mute Any Tab in Chrome — Per-Tab Mute Control"
const description =
  "Mute any tab in Chrome, Edge, or Brave without pausing playback. Silence autoplay ads, noisy tabs, and background video instantly with Audio Tuner."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.muteTab,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.muteTab,
  },
}

export default function Page() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.muteTab}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Tab Muter",
      url,
      description:
        "Per-tab mute control for Chrome, Edge, and Brave. Silence any tab instantly without pausing playback.",
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Mute Tab", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}
      <MuteTabView />
    </>
  )
}
