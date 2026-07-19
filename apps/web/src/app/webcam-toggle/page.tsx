import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  webApplicationSchema,
} from "@/seo"
import { WebcamToggleView } from "@/views/webcam-toggle"
import { faqs } from "@/views/webcam-toggle/sections"

const title = "Webcam Toggle for Chrome — Turn Off Any Tab's Camera"
const description =
  "Free Chrome webcam toggle. Turn off a tab's camera from the toolbar — no clicking through the site to find its camera button. Per-tab, no account, no tracking. Works on Chrome, Edge, and Brave."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.webcamToggle,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.webcamToggle,
  },
}

export default function Page() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.webcamToggle}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Webcam Toggle",
      url,
      description:
        "Per-tab webcam toggle for Chrome, Edge, and Brave. Turn off any tab's camera from the toolbar, without hunting for each site's camera button.",
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Webcam Toggle", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}
      <WebcamToggleView />
    </>
  )
}
