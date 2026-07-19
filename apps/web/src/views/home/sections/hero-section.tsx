import {
  IconBrandGithubFilled,
  IconDownload,
  IconSparkles,
} from "@tabler/icons-react"
import Link from "next/link"

import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { BrowserMockup } from "../components"

function HeroSection() {
  return (
    <section className="relative isolate bg-muted pt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-160 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pt-20 pb-0 text-center sm:px-6 lg:pt-28">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Every tab&apos;s{" "}
          <span className="text-primary">volume, mic, and camera</span> — in
          your toolbar, not buried in site settings
        </h1>

        <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
          Mute one tab — not the whole site — without closing it. Boost quiet
          dialogue past 100% so it&apos;s actually audible on laptop speakers.
          Kill your mic or webcam from the toolbar — no hunting for the
          site&apos;s button.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={siteConfig.links.cta}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <IconDownload className="size-4" />
            Add to Chrome
          </Link>
          <Link
            href={siteConfig.links.github}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <IconBrandGithubFilled className="size-4" />
            View on GitHub
          </Link>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <IconSparkles className="size-3.5 text-primary" />
          Free · No account needed · Works on Chrome, Edge &amp; Brave
        </p>
      </div>

      <div className="relative mx-auto mt-16 max-w-6xl px-4 pb-10 sm:px-6">
        <BrowserMockup className="mx-auto" />
      </div>
    </section>
  )
}

export { HeroSection }
