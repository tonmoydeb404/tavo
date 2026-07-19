import {
  FaqSection,
  FinalCtaSection,
  HowItWorksSection,
  IntroSection,
  UseCasesSection,
  WhyMicSection,
} from "./sections"

import { JsonLd, breadcrumbSchema, faqPageSchema, webApplicationSchema } from "@/seo"
import { faqs } from "./sections/faq-section"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"

function MicToggleView() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.micToggle}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Mic Muter",
      url,
      description:
        "Per-tab microphone mute for Chrome, Edge, and Brave. Toggle your mic off in any tab from the toolbar, without digging through each site's settings.",
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Mic Toggle", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}

      <IntroSection />
      <WhyMicSection />
      <UseCasesSection />
      <HowItWorksSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}

export { MicToggleView }
