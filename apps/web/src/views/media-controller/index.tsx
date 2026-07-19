import { IconAdjustmentsHorizontal } from "@tabler/icons-react"

import { CtaSection, HeroSection } from "@/components/sections"
import { pathsConfig } from "@/configs/path-config"
import {
  FaqSection,
  FeaturesSection,
  HowItWorksSection,
  WhyControllerSection,
} from "./sections"

function MediaControllerView() {
  return (
    <>
      <HeroSection
        badgeIcon={IconAdjustmentsHorizontal}
        badgeText="Media controller for Chrome"
        title="A media controller for every browser tab"
        description="Mute and boost any tab's volume to 400%, and flip your mic and webcam on or off — per tab, from one toolbar controller. For Chrome, Edge, and Brave."
        secondaryCta={{
          href: pathsConfig.features,
          label: "See all features",
        }}
      />
      <WhyControllerSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}

export { MediaControllerView }
