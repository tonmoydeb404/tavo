import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  webApplicationSchema,
} from "@/seo"
import { DesktopView } from "@/views/desktop"
import { faqs } from "@/views/desktop/sections"

const title = "Mac App — Switch Audio Devices, Mute Mic & Route App Audio"
const description =
  "A macOS menu-bar app to switch microphones and outputs, mute your mic with a global hotkey, and route any app's audio to a specific device. Free and open source."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.desktop,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.desktop,
  },
}

export default function Page() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.desktop}`

  const schemas = [
    webApplicationSchema({
      name: `${siteConfig.brand.name} for macOS`,
      url,
      description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "macOS",
      screenshot: `${base}/opengraph-image`,
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Mac app", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}
      <DesktopView />
    </>
  )
}
