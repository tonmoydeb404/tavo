import type { MetadataRoute } from "next"

import { siteConfig } from "@/configs/site-config"

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.brand.url

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Googlebot",
          "Bingbot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
