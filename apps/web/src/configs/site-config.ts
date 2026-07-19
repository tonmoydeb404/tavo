import { brand } from "@workspace/brand"

/**
 * Central site configuration.
 *
 * Brand identity lives in `@workspace/brand` and is shared with the extension.
 * Web-only SEO copy (titles, OG descriptions) stays here.
 */
export const siteConfig = {
  brand: {
    name: brand.name,
    tagline: brand.tagline,
    url: brand.url,
  },

  seo: {
    titleDefault: `${brand.name} — Per-tab volume & media controller for Chrome`,
    titleTemplate: `%s · ${brand.name}`,
    description:
      "A per-tab volume control and media controller for Chrome. Mute and boost any tab to 400%, toggle your mic and webcam — one tab at a time.",
    ogTitle: `${brand.name} — volume, mic, and webcam control for every tab`,
    ogDescription:
      "Mute, boost, and toggle mic and webcam on any tab — without digging through settings. Free, for Chrome, Edge, and Brave.",
  },

  links: brand.links,

  developer: brand.developer,
} as const

export type SiteConfig = typeof siteConfig
