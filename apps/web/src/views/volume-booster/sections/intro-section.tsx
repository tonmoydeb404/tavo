import { IconDownload, IconVolume } from "@tabler/icons-react"
import Link from "next/link"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Badge } from "@workspace/ui/components/badge"

function IntroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-muted pt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 size-136 rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-col items-center gap-6 text-center">
          <Badge variant={"default"}>
            <IconVolume className="size-3.5 text-primary-foreground" />
            Volume booster for Chrome
          </Badge>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Volume Booster for Chrome
          </h1>

          <p className="max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
            Make any tab up to{" "}
            <strong className="font-semibold text-primary">400% louder</strong>{" "}
            — quiet YouTube videos, inaudible podcasts, and muffled video calls
            become easy to hear. Audio Tuner uses the Web Audio API to push any
            tab past your system&apos;s 100% ceiling.
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
