/**
 * Schema.org factories for structured data (JSON-LD).
 *
 * These return plain objects shaped to schema.org types. Pass the result to
 * `<JsonLd schema={...} />` to render in a page.
 */

type FaqEntry = { question: string; answer: string }

/** FAQPage schema. Princeton GEO research: +40% AI visibility. */
export function faqPageSchema(faqs: readonly FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } as const
}

type WebApplicationInput = {
  name: string
  url: string
  description: string
  applicationCategory?: string
  operatingSystem?: string
  offers?: { price?: string; priceCurrency?: string }
  screenshot?: string
}

/** WebApplication schema. Use on product/feature pages. */
export function webApplicationSchema({
  name,
  url,
  description,
  applicationCategory = "BrowserApplication",
  operatingSystem = "Chrome, Edge, Brave, Firefox",
  offers,
  screenshot,
}: WebApplicationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      "@type": "Offer",
      price: offers?.price ?? "0",
      priceCurrency: offers?.priceCurrency ?? "USD",
    },
    ...(screenshot ? { screenshot } : {}),
  } as const
}

type OrganizationInput = {
  name: string
  url: string
  email?: string
  logo?: string
  sameAs?: string[]
}

/** Organization schema. Use on the home page and /about. */
export function organizationSchema({
  name,
  url,
  email,
  logo,
  sameAs,
}: OrganizationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(email ? { email } : {}),
    ...(logo ? { logo } : {}),
    ...(sameAs ? { sameAs } : {}),
  } as const
}

type BreadcrumbItem = { name: string; url: string }

/** BreadcrumbList schema. Use on deep pages to reinforce site structure. */
export function breadcrumbSchema(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  } as const
}
