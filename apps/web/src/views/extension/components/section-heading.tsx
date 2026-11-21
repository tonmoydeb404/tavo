import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: "left" | "center"
  className?: string
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        align === "left" && "items-start text-left",
        className
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 font-mono text-xs font-medium tracking-widest text-primary uppercase">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-primary"
          />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export { SectionHeading }
