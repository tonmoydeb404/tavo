import { IconDownload, IconVolumeOff } from "@tabler/icons-react"
import Link from "next/link"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

function IntroSection() {
  return (
    <section className="relative isolate bg-muted pt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 size-136 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-col items-center gap-6 text-center">
          <Badge>
            <IconVolumeOff className="size-3.5 text-primary-foreground" />
            Per-tab mute for Chrome
          </Badge>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Mute Any Tab in Chrome
          </h1>

          <p className="max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
            Silence the tab — not your whole browser. Mute autoplay ads,
            background YouTube, and chatty tabs in one click while your music
            keeps playing. Audio Tuner gives every browser tab its own mute
            button.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={siteConfig.links.cta}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              <IconDownload className="size-4" />
              Add to Chrome — free
            </Link>
            <Link
              href={pathsConfig.help}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              How it works
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            Free · No account · Works on Chrome, Edge &amp; Brave
          </p>
        </div>
      </div>
    </section>
  )
}

export { IntroSection }
