/**
 * Central site configuration.
 *
 * Update this file to change branding and SEO metadata across the site.
 */

export const siteConfig = {
  /** Brand identity */
  brand: {
    name: "Audio Tuner",
    url: "https://example.com",
    /** Short tagline used in metadata */
    tagline: "Per-tab volume, mic, and webcam control",
  },

  /** SEO metadata */
  seo: {
    titleDefault:
      "Audio Tuner — Per-tab volume & media controller for Chrome",
    titleTemplate: "%s · Audio Tuner",
    description:
      "A per-tab volume control and media controller for Chrome. Mute and boost any tab to 400%, toggle your mic and webcam — one tab at a time.",
    ogTitle: "Audio Tuner — volume, mic, and webcam control for every tab",
    ogDescription:
      "Mute, boost, and toggle mic and webcam on any tab — without digging through settings. Free, for Chrome, Edge, and Brave.",
  },

  /** Contact + social links — update with real URLs */
  links: {
    /** Primary call-to-action. Swap for the Chrome Web Store URL when live. */
    cta: "#",
    /** Update with your real GitHub repo */
    github: "https://github.com/your-org/audio-tuner",
    email: "hello@example.com",
  },
} as const

export type SiteConfig = typeof siteConfig
