import {
  FaqSection,
  FinalCtaSection,
  HowItWorksSection,
  IntroSection,
  UseCasesSection,
  WhyMuteSection,
} from "./sections"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { JsonLd, breadcrumbSchema, faqPageSchema, webApplicationSchema } from "@/seo"
import { faqs } from "./sections/faq-section"

function MuteTabView() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.muteTab}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Tab Muter",
      url,
      description:
        "Per-tab mute control for Chrome, Edge, and Brave. Silence any tab instantly without pausing playback.",
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Mute Tab", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}

      <IntroSection />
      <WhyMuteSection />
      <UseCasesSection />
      <HowItWorksSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}

export { MuteTabView }
