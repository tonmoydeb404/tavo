import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  webApplicationSchema,
} from "@/seo"
import { MediaControllerView } from "@/views/media-controller"
import { faqs } from "@/views/media-controller/sections"

const title = "Media Controller for Chrome — Volume, Mic & Webcam Per Tab"
const description =
  "A per-tab media controller for Chrome. Mute and boost any tab's volume to 400%, toggle your mic and webcam, one tab at a time. Free, no account, no tracking. Works on Chrome, Edge, and Brave."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.mediaController,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.mediaController,
  },
}

export default function Page() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.mediaController}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Media Controller",
      url,
      description:
        "Per-tab media controller for Chrome, Edge, and Brave. Mute and boost any tab's volume to 400%, and toggle your mic and webcam, one tab at a time.",
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Media Controller", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}
      <MediaControllerView />
    </>
  )
}
