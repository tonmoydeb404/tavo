import {
  IconBrandApple,
  IconBrandChrome,
  IconSparkles,
} from "@tabler/icons-react"
import Link from "next/link"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

function HeroSection() {
  return (
    <section className="relative isolate bg-muted pt-10 pb-20 dark:bg-black">
      <div className="relative container flex flex-col items-center pt-20 text-center lg:pt-28">
        <h1 className="max-w-4xl font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Take control of your audio —{" "}
          <span className="text-primary">in the browser and on your Mac</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
          {siteConfig.brand.name} is two small tools for the same problem. A
          browser extension gives every tab its own volume, mic, and camera
          controls. A macOS menu-bar app switches devices, mutes your mic, and
          sends each app&apos;s audio where you want it.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={siteConfig.links.chromeStore}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <IconBrandChrome className="size-4" />
            Add to Chrome
          </Link>
          <Link
            href={pathsConfig.desktop}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <IconBrandApple className="size-4" />
            Get the Mac app
          </Link>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <IconSparkles className="size-3.5 text-primary" />
          Free · No account needed · Open source
        </p>
      </div>
    </section>
  )
}

export { HeroSection }
