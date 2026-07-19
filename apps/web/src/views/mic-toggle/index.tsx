import { IconMicrophoneOff } from "@tabler/icons-react"

import { CtaSection, HeroSection } from "@/components/sections"
import {
  FaqSection,
  HowItWorksSection,
  UseCasesSection,
  WhyMicSection,
} from "./sections"

function MicToggleView() {
  return (
    <>
      <HeroSection
        badgeIcon={IconMicrophoneOff}
        badgeText="Mic toggle for Chrome"
        title="Mute your mic in any tab"
        description="Flip your microphone off from the toolbar — in Google Meet, Zoom, or Teams, on any site — without hunting for the in-call mute button. Per tab, one click."
      />
      <WhyMicSection />
      <UseCasesSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}

export { MicToggleView }
