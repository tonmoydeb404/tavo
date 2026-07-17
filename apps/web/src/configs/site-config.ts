/**
 * Central site configuration.
 *
 * Update this file to change branding and SEO metadata across the site.
 */

export const siteConfig = {
  /** Brand identity */
  brand: {
    name: "Extension Name",
    url: "https://example.com",
    /** Short tagline used in metadata */
    tagline: "A browser extension companion site.",
  },

  /** SEO metadata */
  seo: {
    titleDefault: "Extension Name",
    titleTemplate: "%s · Extension Name",
    description: "Companion site for the Extension Name browser extension.",
    ogTitle: "Extension Name",
    ogDescription: "Companion site for the Extension Name browser extension.",
  },

  /** Contact + social links — update with real URLs */
  links: {
    /** Update with your real GitHub repo */
    github: "https://github.com/your-org/your-extension",
    email: "hello@example.com",
  },
} as const

export type SiteConfig = typeof siteConfig
