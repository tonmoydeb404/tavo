import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { JsonLd, organizationSchema } from "@/seo"
import { HomeView } from "@/views/home"

export const metadata: Metadata = {
  alternates: {
    canonical: pathsConfig.home,
  },
}

export default function Page() {
  const schema = organizationSchema({
    name: siteConfig.brand.name,
    url: siteConfig.brand.url,
    email: siteConfig.links.email,
    sameAs: [siteConfig.links.github],
  })

  return (
    <>
      <JsonLd schema={schema} />
      <HomeView />
    </>
  )
}
