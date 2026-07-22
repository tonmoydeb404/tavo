/**
 * Canonical brand identity for Tavo.
 *
 * Shared by `apps/web` and `apps/extension`. Anything that varies between
 * the two (SEO titles, OG copy, manifest version_name, etc.) stays in the
 * app-level config and consumes these values.
 */
export const brand = {
  name: "Tavo",

  /** Short tagline used in headers, metadata, and store listings. */
  tagline: "Per-tab volume, mic, and webcam control",

  /**
   * Store-safe description (<= 132 chars per Chrome Web Store policy).
   * Longer marketing copy for web SEO lives in `apps/web` site-config.
   */
  description:
    "Mute tabs and adjust per-tab volume (0-400%) for any playing audio or video.",

  /** Canonical marketing site URL. */
  url: "https://tavo.tonmoydeb.com",

  /** Contact + social links. */
  links: {
    github: "https://github.com/tonmoydeb404/tavo",
    email: "tonmoydeb404@gmail.com",
    chromeStore:
      "https://chromewebstore.google.com/detail/hhfdekajhmbohefcoilmclchpbedpcon",
  },

  /** Developer credit. */
  developer: {
    name: "Tonmoy Deb",
    portfolio: "https://tonmoydeb.com",
  },
} as const

export type Brand = typeof brand
