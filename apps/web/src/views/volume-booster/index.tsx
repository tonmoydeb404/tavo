import {
  FaqSection,
  FinalCtaSection,
  HowItWorksSection,
  IntroSection,
  UseCasesSection,
  WhyBoosterSection,
} from "./sections"

import { JsonLd, breadcrumbSchema, faqPageSchema, webApplicationSchema } from "@/seo"
import { faqs } from "./sections/faq-section"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"

function VolumeBoosterView() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.volumeBooster}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Volume Booster",
      url,
      description:
        "Free per-tab volume booster for Chrome, Edge, and Brave. Boost any tab up to 400% using the Web Audio API.",
      screenshot: `${base}/opengraph-image`,
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Volume Booster", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}

      <IntroSection />
      <WhyBoosterSection />
      <UseCasesSection />
      <HowItWorksSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}

export { VolumeBoosterView }
