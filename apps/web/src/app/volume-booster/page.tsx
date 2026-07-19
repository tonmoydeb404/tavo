import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  webApplicationSchema,
} from "@/seo"
import { VolumeBoosterView } from "@/views/volume-booster"
import { faqs } from "@/views/volume-booster/sections"

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
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.volumeBooster}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Volume Booster",
      url,
      description:
        "Free per-tab volume booster for Chrome, Edge, and Brave. Boost any tab up to 400% using the Web Audio API.",
      screenshot: `${base}/opengraph-image`,
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Volume Booster", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}
      <VolumeBoosterView />
    </>
  )
}
