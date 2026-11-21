import { IconBrandApple, IconBrandChrome } from "@tabler/icons-react"
import Link from "next/link"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { HeroVisual } from "../components"

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[56px_56px] opacity-50"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
        }}
      />

      <div className="container">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Free · Open source · No account
          </span>

          <h1 className="mt-8 font-heading text-6xl leading-[0.92] font-extrabold tracking-tighter text-balance sm:text-7xl lg:text-8xl">
            Mute the tab.
            <br />
            <span className="text-primary">Not the meeting.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
            {siteConfig.brand.name} is audio control for the two places sound
            actually lives — your browser and your Mac. Per-tab volume, a hotkey
            for your mic, and a say in where every app plays.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={siteConfig.links.chromeStore}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
            >
              <IconBrandChrome className="size-4" />
              Add to Chrome
            </Link>
            <Link
              href={pathsConfig.desktop}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5"
              )}
            >
              <IconBrandApple className="size-4" />
              Get the Mac app
            </Link>
          </div>
        </div>

        <HeroVisual className="mt-20" />
      </div>
    </section>
  )
}

export { HeroSection }
