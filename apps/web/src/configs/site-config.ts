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
    titleDefault: `${brand.name} — Audio control for your browser and your Mac`,
    titleTemplate: `%s · ${brand.name}`,
    description:
      "Audio control in two places. A browser extension for per-tab volume, mic, and webcam control, and a macOS menu-bar app for switching devices, muting your mic, and routing app audio.",
    ogTitle: `${brand.name} — audio control for your browser and your Mac`,
    ogDescription:
      "Per-tab volume, mic, and webcam control in Chrome, plus a macOS menu-bar app to switch devices, mute your mic, and route app audio. Free and open source.",
  },

  links: {
    ...brand.links,
    releases: `${brand.links.github}/releases/latest`,
  },

  desktop: {
    installScript:
      "curl -fsSL https://raw.githubusercontent.com/tonmoydeb404/tavo/main/setup/unix.sh | sh",
  },

  developer: brand.developer,
} as const

export type SiteConfig = typeof siteConfig
