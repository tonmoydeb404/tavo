import { CtaSection } from "@/components/sections"
import {
  FaqSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  ProblemSection,
} from "./sections"

function HomeView() {
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

export { HomeView }
