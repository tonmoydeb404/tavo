import Link from "next/link"
import type { ComponentType, ReactNode } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type Cta = {
  href: string
  label: string
  icon?: ComponentType<{ className?: string }>
}

type HeroSectionProps = {
  badgeIcon: ComponentType<{ className?: string }>
  badgeText: string
  title: ReactNode
  description: ReactNode
  primaryCta?: Cta
  secondaryCta?: Cta
  footnote?: string
  children?: ReactNode
}

function HeroSection({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  description,
  primaryCta,
  secondaryCta,
  footnote,
  children,
}: HeroSectionProps) {
  const PrimaryIcon = primaryCta?.icon
  const SecondaryIcon = secondaryCta?.icon

  return (
    <section className="relative isolate overflow-hidden bg-muted pt-10 dark:bg-black">
      <div className="container flex flex-col items-center gap-6 py-20 text-center lg:py-28">
        <Badge>
          <BadgeIcon />
          {badgeText}
        </Badge>

        <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        <p className="max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
          {description}
        </p>

        {(primaryCta || secondaryCta) && (
          <div className="flex flex-col gap-3 sm:flex-row">
            {primaryCta && (
              <Link
                href={primaryCta.href}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                {PrimaryIcon ? <PrimaryIcon className="size-4" /> : null}
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                {SecondaryIcon ? <SecondaryIcon className="size-4" /> : null}
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        )}

        {footnote && (
          <p className="text-xs text-muted-foreground">{footnote}</p>
        )}

        {children}
      </div>
    </section>
  )
}

export { HeroSection }
export type { HeroSectionProps }
