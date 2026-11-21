import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { ExtensionView } from "@/views/extension"

import { siteConfig } from "@/configs/site-config"
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  webApplicationSchema,
} from "@/seo"
import { faqs } from "@/views/extension/sections"

const title = "Browser Extension — Per-Tab Volume, Mic & Webcam Control"
const description =
  "Per-tab volume, mic, and webcam controls in your toolbar. Mute and boost any tab up to 400%, and flip your mic or camera off. Free, for Chrome, Edge, and Brave."

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.extension,
  },
  alternates: {
    canonical: pathsConfig.extension,
  },
}

export default function Page() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.extension}`

  const schemas = [
    webApplicationSchema({
      name: siteConfig.brand.name,
      url,
      description:
        "Per-tab volume, mic, and webcam controls that live in your toolbar. Mute and boost any tab up to 400%, and flip your mic or camera off without digging through site settings. For Chrome, Edge, and Brave.",
      screenshot: `${base}/opengraph-image`,
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Extension", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}
      <ExtensionView />
    </>
  )
}
