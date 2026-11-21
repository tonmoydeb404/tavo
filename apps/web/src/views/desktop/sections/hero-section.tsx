import { IconBrandApple, IconBrandGithubFilled } from "@tabler/icons-react"
import Link from "next/link"

import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { TrayDemo } from "../components"

function HeroSection() {
  return (
    <section className="dark relative isolate overflow-hidden bg-background pt-32 pb-24 text-foreground lg:pt-44">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent)]"
      />

      <div className="container">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 font-mono text-xs text-muted-foreground">
            <IconBrandApple className="size-3.5" />
            macOS · Apple Silicon · v0.1
          </span>

          <h1 className="mt-8 font-heading text-6xl leading-[0.92] font-extrabold tracking-tighter text-balance sm:text-7xl lg:text-8xl">
            Your Mac&apos;s sound,
            <br />
            <span className="text-primary">one click away.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
            Switch microphones and speakers, mute your mic with a hotkey, and
            send each app&apos;s audio to its own device — without opening
            System Settings once.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={siteConfig.links.releases}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
            >
              <IconBrandApple className="size-4" />
              Download for macOS
            </Link>
            <Link
              href={siteConfig.links.github}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5"
              )}
            >
              <IconBrandGithubFilled className="size-4" />
              View on GitHub
            </Link>
          </div>
        </div>

        <div className="mt-20">
          <p className="mb-4 text-center font-mono text-xs tracking-widest text-muted-foreground uppercase">
            ↓ Try it — this menu is live
          </p>
          <TrayDemo />
        </div>
      </div>
    </section>
  )
}

export { HeroSection }
