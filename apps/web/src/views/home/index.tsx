import {
  FaqSection,
  FeaturesSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  ProblemSection,
} from "./sections"
import { faqs } from "./sections/faq-section"

import { siteConfig } from "@/configs/site-config"
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  organizationSchema,
  webApplicationSchema,
} from "@/seo"

function HomeView() {
  const base = siteConfig.brand.url

  const schemas = [
    organizationSchema({
      name: siteConfig.brand.name,
      url: base,
      email: siteConfig.links.email,
      sameAs: [siteConfig.links.github],
    }),
    webApplicationSchema({
      name: siteConfig.brand.name,
      url: base,
      description:
        "Per-tab volume, mic, and webcam controls that live in your toolbar. Mute and boost any tab up to 400%, and flip your mic or camera off without digging through site settings. For Chrome, Edge, and Brave.",
      screenshot: `${base}/opengraph-image`,
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([{ name: "Home", url: base }]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}

      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}

export { HomeView }
