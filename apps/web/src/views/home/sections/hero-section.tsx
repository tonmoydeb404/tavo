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
    <section className="relative isolate bg-muted pt-10 pb-20 dark:bg-black">
      <div className="relative container flex flex-col items-center pt-20 text-center lg:pt-28">
        <h1 className="max-w-4xl font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Every tab&apos;s{" "}
          <span className="text-primary">volume, mic, and camera</span> — in
          your toolbar, not buried in site settings
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
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

        <BrowserMockup className="mt-12 max-w-4xl" />
      </div>
    </section>
  )
}

export { HeroSection }
