import Link from "next/link"
import { IconAdjustmentsHorizontal, IconDownload } from "@tabler/icons-react"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { AudioWave } from "@/views/home/components"

function IntroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 size-[34rem] rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
            <IconAdjustmentsHorizontal className="size-3.5 text-primary" />
            Media controller for Chrome
          </span>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            A media controller for every browser tab
          </h1>

          <p className="max-w-2xl text-pretty text-lg text-white/70 sm:text-xl">
            Mute and boost any tab&apos;s volume to 400%, and flip your mic and
            webcam on or off — per tab, from one toolbar controller. For Chrome,
            Edge, and Brave.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={siteConfig.links.cta}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              <IconDownload className="size-4" />
              Add to Chrome — free
            </Link>
            <Link
              href={pathsConfig.help}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              How it works
            </Link>
          </div>

          <p className="text-xs text-white/50">
            Free · No account · Works on Chrome, Edge &amp; Brave
          </p>

          <div className="mt-4 w-full max-w-md text-primary/70">
            <AudioWave bars={48} />
          </div>
        </div>
      </div>
    </section>
  )
}

export { IntroSection }
