import {
  IconBrandApple,
  IconBrandGithubFilled,
  IconSparkles,
} from "@tabler/icons-react"
import Link from "next/link"

import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { TrayMockup } from "../components"

function HeroSection() {
  return (
    <section className="relative isolate bg-muted pt-10 pb-20 dark:bg-black">
      <div className="relative container flex flex-col items-center pt-20 text-center lg:pt-28">
        <h1 className="max-w-4xl font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Your Mac&apos;s{" "}
          <span className="text-primary">
            microphones, speakers, and app audio
          </span>{" "}
          — in the menu bar
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
          Switch devices in one click, mute your mic with a hotkey, and send
          YouTube to your speakers while a call plays on your earphones. No
          trips to System Settings.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={siteConfig.links.releases}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <IconBrandApple className="size-4" />
            Download for macOS
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
          Free · No account needed · Apple Silicon
        </p>

        <TrayMockup className="mt-12" />
      </div>
    </section>
  )
}

export { HeroSection }
