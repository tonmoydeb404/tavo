import type { ReactNode } from "react"

import { assets } from "@/assets"
import Image from "next/image"

type FeatureLayoutProps = {
  /** Eyebrow label above the headline, e.g. "Volume booster". */
  badge: string
  /** Big headline. Use `<span className="text-primary">` to highlight a word. */
  headline: ReactNode
  /** Supporting paragraph below the headline. */
  copy: ReactNode
  /** Feature pills rendered as a wrap-row. */
  pills: string[]
  /** The popup mock (a `FeaturePopup`) shown on the right. */
  popup: ReactNode
}

/**
 * 1280x800 layout shared by every feature screenshot. Brand mark + headline
 * + supporting copy + pills on the left, the live popup state on the right.
 * Same backbone for all five feature shots so the store listing feels
 * cohesive when shoppers swipe through them.
 */
function FeatureScreenshotLayout({
  badge,
  headline,
  copy,
  pills,
  popup,
}: FeatureLayoutProps) {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 size-[440px] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex w-full items-center justify-between gap-10 px-16">
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold tracking-wide text-primary uppercase">
            {badge}
          </span>
          <h1 className="mt-6 font-heading text-6xl leading-[1.05] font-bold tracking-tight text-balance">
            {headline}
          </h1>
          <p className="mt-5 text-xl text-pretty text-muted-foreground">
            {copy}
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {pills.map((feature) => (
              <li
                key={feature}
                className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm font-medium"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-end">{popup}</div>
        <Image
          src={assets.logo}
          alt="Brand logo"
          className="absolute top-10 left-10 size-40 rotate-[-15deg] opacity-50"
        />
      </div>
    </div>
  )
}

export { FeatureScreenshotLayout }
