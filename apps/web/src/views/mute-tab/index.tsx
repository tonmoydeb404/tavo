import { IconVolumeOff } from "@tabler/icons-react"

import { CtaSection, HeroSection } from "@/components/sections"
import {
  FaqSection,
  HowItWorksSection,
  UseCasesSection,
  WhyMuteSection,
} from "./sections"

function MuteTabView() {
  return (
    <>
      <HeroSection
        badgeIcon={IconVolumeOff}
        badgeText="Per-tab mute for Chrome"
        title="Mute Any Tab in Chrome"
        description="Silence the tab — not your whole browser. Mute autoplay ads, background YouTube, and chatty tabs in one click while your music keeps playing. Audio Tuner gives every browser tab its own mute button."
      />
      <WhyMuteSection />
      <UseCasesSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}

export { MuteTabView }
