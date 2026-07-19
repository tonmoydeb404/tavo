import type { MetadataRoute } from "next"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.brand.url

  const yearly = { changeFrequency: "yearly" as const, priority: 0.3 }

  return [
    {
      url: `${base}${pathsConfig.home}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}${pathsConfig.volumeBooster}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}${pathsConfig.muteTab}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}${pathsConfig.micToggle}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}${pathsConfig.webcamToggle}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}${pathsConfig.mediaController}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}${pathsConfig.features}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}${pathsConfig.faq}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}${pathsConfig.about}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${base}${pathsConfig.help}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}${pathsConfig.changelog}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}${pathsConfig.privacy}`,
      lastModified: new Date(),
      ...yearly,
    },
    {
      url: `${base}${pathsConfig.terms}`,
      lastModified: new Date(),
      ...yearly,
    },
  ]
}
