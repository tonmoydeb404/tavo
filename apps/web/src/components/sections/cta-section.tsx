import { IconBrandGithubFilled, IconDownload } from "@tabler/icons-react"
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
  "Install Audio Tuner and get volume, mic, and webcam controls on every tab — without digging through settings. Free, private, ready in seconds."

const defaultPrimaryCta: Cta = {
  href: siteConfig.links.cta,
  label: "Add to Chrome",
  icon: IconDownload,
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
    <section className="relative bg-muted">
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={primaryCta.href}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            {PrimaryIcon ? <PrimaryIcon className="size-4" /> : null}
            {primaryCta.label}
          </Link>
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
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
