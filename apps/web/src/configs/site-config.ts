import { envConfig } from "./env-config"

/**
 * Central site configuration.
 */
export const siteConfig = {
  /** Brand identity */
  brand: {
    name: "Tavo",
    url: envConfig.SITE_URL,
    /** Short tagline used in metadata */
    tagline: "Per-tab volume, mic, and webcam control",
  },

  /** SEO metadata */
  seo: {
    titleDefault: "Tavo — Per-tab volume & media controller for Chrome",
    titleTemplate: "%s · Tavo",
    description:
      "A per-tab volume control and media controller for Chrome. Mute and boost any tab to 400%, toggle your mic and webcam — one tab at a time.",
    ogTitle: "Tavo — volume, mic, and webcam control for every tab",
    ogDescription:
      "Mute, boost, and toggle mic and webcam on any tab — without digging through settings. Free, for Chrome, Edge, and Brave.",
  },

  /** Contact + social links — update with real URLs */
  links: {
    github: "https://github.com/tonmoydeb404/tavo",
    email: "tonmoydeb404@gmail.com",
    chromeStore: envConfig.CHROME_STORE_URL,
  },

  /** Developer credit */
  developer: {
    name: "Tonmoy Deb",
    portfolio: "https://tonmoydeb.com",
  },
} as const

export type SiteConfig = typeof siteConfig
