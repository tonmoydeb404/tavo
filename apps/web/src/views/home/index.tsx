import { IconBrandApple, IconBrandChrome } from "@tabler/icons-react"

import { CtaSection } from "@/components/sections"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import {
  HeroSection,
  MomentsSection,
  PrinciplesSection,
  ProductsSection,
  TickerSection,
} from "./sections"

function HomeView() {
  return (
    <>
      <HeroSection />
      <TickerSection />
      <MomentsSection />
      <ProductsSection />
      <PrinciplesSection />
      <CtaSection
        title="Take the volume knob back."
        description="Add the extension for per-tab control in your browser, get the Mac app for your whole system — or take both. Free and private."
        primaryCta={{
          href: siteConfig.links.chromeStore,
          label: "Add to Chrome",
          icon: IconBrandChrome,
        }}
        secondaryCta={{
          href: pathsConfig.desktop,
          label: "Get the Mac app",
          icon: IconBrandApple,
        }}
      />
    </>
  )
}

export { HomeView }
