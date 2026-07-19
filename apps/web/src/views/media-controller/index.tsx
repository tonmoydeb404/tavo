import {
  FaqSection,
  FeaturesSection,
  FinalCtaSection,
  HowItWorksSection,
  IntroSection,
  WhyControllerSection,
} from "./sections"

import { JsonLd, breadcrumbSchema, faqPageSchema, webApplicationSchema } from "@/seo"
import { faqs } from "./sections/faq-section"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"

function MediaControllerView() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.mediaController}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Media Controller",
      url,
      description:
        "Per-tab media controller for Chrome, Edge, and Brave. Mute and boost any tab's volume to 400%, and toggle your mic and webcam, one tab at a time.",
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Media Controller", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}

      <IntroSection />
      <WhyControllerSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}

export { MediaControllerView }
