import { IconVolume } from "@tabler/icons-react"

import { CtaSection, HeroSection } from "@/components/sections"
import {
  FaqSection,
  HowItWorksSection,
  UseCasesSection,
  WhyBoosterSection,
} from "./sections"

function VolumeBoosterView() {
  return (
    <>
      <HeroSection
        badgeIcon={IconVolume}
        badgeText="Volume booster for Chrome"
        title="Volume Booster for Chrome"
        description={
          <>
            Make any tab up to{" "}
            <strong className="font-semibold text-primary">400% louder</strong>{" "}
            — quiet YouTube videos, inaudible podcasts, and muffled video calls
            become easy to hear. Audio Tuner uses the Web Audio API to push any
            tab past your system&apos;s 100% ceiling.
          </>
        }
      />
      <WhyBoosterSection />
      <UseCasesSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}

export { VolumeBoosterView }
