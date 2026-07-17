import type { MetadataRoute } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.brand.url

  return [
    {
      url: `${base}${pathsConfig.home}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}${pathsConfig.privacy}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}${pathsConfig.terms}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}
