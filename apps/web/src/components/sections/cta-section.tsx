import { IconBrandChrome, IconBrandGithubFilled } from "@tabler/icons-react"
import Link from "next/link"
import type { ComponentType, ReactNode } from "react"

import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type Cta = {
  href: string
  label: string
  icon?: ComponentType<{ className?: string }>
}

type CtaSectionProps = {
  title?: ReactNode
  description?: ReactNode
  primaryCta?: Cta
  secondaryCta?: Cta
}

const defaultTitle = "Ready to take control?"

const defaultDescription =
  "Install Tavo and get volume, mic, and webcam controls on every tab — without digging through settings. Free, private, ready in seconds."

const defaultPrimaryCta: Cta = {
  href: siteConfig.links.chromeStore,
  label: "Add to Chrome",
  icon: IconBrandChrome,
}

const defaultSecondaryCta: Cta = {
  href: siteConfig.links.github,
  label: "View on GitHub",
  icon: IconBrandGithubFilled,
}

function CtaSection({
  title = defaultTitle,
  description = defaultDescription,
  primaryCta = defaultPrimaryCta,
  secondaryCta = defaultSecondaryCta,
}: CtaSectionProps = {}) {
  const PrimaryIcon = primaryCta.icon
  const SecondaryIcon = secondaryCta?.icon

  return (
    <section className="container pb-20">
      <div className="dark relative isolate overflow-hidden rounded-[2rem] bg-background px-6 py-20 text-center text-foreground sm:px-12 sm:py-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_120%,color-mix(in_oklch,var(--primary)_55%,transparent),transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 flex h-24 items-end gap-1 px-4 opacity-25"
        >
          {Array.from({ length: 48 }).map((_, i) => (
            <span
              key={i}
              className="eq-bar h-full flex-1 rounded-t-full bg-primary"
              style={{
                animationDelay: `${(i * 137) % 900}ms`,
                animationDuration: `${900 + ((i * 53) % 700)}ms`,
              }}
            />
          ))}
        </div>

        <h2 className="mx-auto max-w-3xl font-heading text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
          {description}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={primaryCta.href}
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
          >
            {PrimaryIcon ? <PrimaryIcon className="size-4" /> : null}
            {primaryCta.label}
          </Link>
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5"
              )}
            >
              {SecondaryIcon ? <SecondaryIcon className="size-4" /> : null}
              {secondaryCta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export { CtaSection }
export type { CtaSectionProps }
