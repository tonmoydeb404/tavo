import Link from "next/link"
import { IconBrandGithubFilled, IconDownload } from "@tabler/icons-react"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { AudioWave } from "@/views/home/components"

function FinalCtaSection() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border/60 bg-neutral-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <AudioWave className="mx-auto mb-8 h-10 w-48 text-primary/70" bars={40} />
        <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Turn the camera off on any tab
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-white/70">
          Install Audio Tuner and put a webcam switch in your toolbar — no more
          hunting for each site’s camera button. Free, private, ready in
          seconds.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={siteConfig.links.cta}
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <IconDownload className="size-4" />
            Add to Chrome
          </Link>
          <Link
            href={pathsConfig.micToggle}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white",
            )}
          >
            Mute your mic too?
          </Link>
          <Link
            href={siteConfig.links.github}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white",
            )}
          >
            <IconBrandGithubFilled className="size-4" />
            View on GitHub
          </Link>
        </div>
      </div>
    </section>
  )
}

export { FinalCtaSection }
