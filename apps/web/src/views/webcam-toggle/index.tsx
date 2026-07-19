import {
  FaqSection,
  FinalCtaSection,
  HowItWorksSection,
  IntroSection,
  UseCasesSection,
  WhyWebcamSection,
} from "./sections"

import { JsonLd, breadcrumbSchema, faqPageSchema, webApplicationSchema } from "@/seo"
import { faqs } from "./sections/faq-section"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"

function WebcamToggleView() {
  const base = siteConfig.brand.url
  const url = `${base}${pathsConfig.webcamToggle}`

  const schemas = [
    webApplicationSchema({
      name: "Audio Tuner — Webcam Toggle",
      url,
      description:
        "Per-tab webcam toggle for Chrome, Edge, and Brave. Turn off any tab's camera from the toolbar, without hunting for each site's camera button.",
    }),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: "Home", url: base },
      { name: "Webcam Toggle", url },
    ]),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <JsonLd key={schema["@type"]} schema={schema} />
      ))}

      <IntroSection />
      <WhyWebcamSection />
      <UseCasesSection />
      <HowItWorksSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  )
}

export { WebcamToggleView }
