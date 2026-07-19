import { IconVideoOff } from "@tabler/icons-react"

import { CtaSection, HeroSection } from "@/components/sections"
import {
  FaqSection,
  HowItWorksSection,
  UseCasesSection,
  WhyWebcamSection,
} from "./sections"

function WebcamToggleView() {
  return (
    <>
      <HeroSection
        badgeIcon={IconVideoOff}
        badgeText="Webcam toggle for Chrome"
        title="Turn off any tab's camera"
        description="Flip the webcam off from the toolbar — no clicking through a site to find its camera button. Per tab, one click, on any site."
      />
      <WhyWebcamSection />
      <UseCasesSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}

export { WebcamToggleView }
