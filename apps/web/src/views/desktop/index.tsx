import { IconBrandApple, IconBrandGithubFilled } from "@tabler/icons-react"

import { CtaSection } from "@/components/sections"
import { siteConfig } from "@/configs/site-config"
import {
  FaqSection,
  FeaturesSection,
  HeroSection,
  InstallSection,
  ProblemSection,
} from "./sections"

function DesktopView() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <InstallSection />
      <FaqSection />
      <CtaSection
        title="Stop digging through System Settings."
        description="Download Tavo for macOS and manage devices, mic, and app audio from the menu bar. Free, private, and open source."
        primaryCta={{
          href: siteConfig.links.releases,
          label: "Download for macOS",
          icon: IconBrandApple,
        }}
        secondaryCta={{
          href: siteConfig.links.github,
          label: "View on GitHub",
          icon: IconBrandGithubFilled,
        }}
      />
    </>
  )
}

export { DesktopView }
