import { CtaSection } from "@/components/sections"
import {
  FaqSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  ProblemSection,
} from "./sections"

function ExtensionView() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}

export { ExtensionView }
