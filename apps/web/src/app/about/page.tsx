import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { JsonLd, organizationSchema } from "@/seo"
import { AboutView } from "@/views/about"

const title = "About Audio Tuner"
const description =
  "Audio Tuner is a free, privacy-first media controller for your browser — per-tab volume, mic, and webcam. No servers, no tracking, no account required."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: pathsConfig.about,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: pathsConfig.about,
  },
}

export default function Page() {
  const base = siteConfig.brand.url

  return (
    <>
      <JsonLd
        schema={organizationSchema({
          name: siteConfig.brand.name,
          url: base,
          email: siteConfig.links.email,
          sameAs: [siteConfig.links.github],
        })}
      />
      <AboutView />
    </>
  )
}
