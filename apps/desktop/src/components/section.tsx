import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

// A titled block: small heading (+ optional action on the right), an
// optional one-line description, then the content — usually a <Group>.
function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <div className="flex min-h-5 items-end justify-between gap-2 px-1">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h2>
        {action}
      </div>
      {description ? (
        <p className="-mt-1 px-1 text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  )
}

// Rounded surface that stacks <Row>s with hairline dividers.
function Group({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-xs",
        className
      )}
    >
      {children}
    </div>
  )
}

// One line inside a <Group>: optional leading visual, title + hint, and a
// trailing control.
function Row({
  leading,
  title,
  hint,
  trailing,
  children,
  className,
}: {
  leading?: ReactNode
  title?: ReactNode
  hint?: ReactNode
  trailing?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2.5 px-3 py-2.5", className)}>
      {title || leading || trailing ? (
        <div className="flex min-h-8 items-center gap-3">
          {leading}
          <div className="flex min-w-0 flex-1 flex-col">
            {title ? (
              <span className="truncate text-sm font-medium">{title}</span>
            ) : null}
            {hint ? (
              <span className="truncate text-xs text-muted-foreground">
                {hint}
              </span>
            ) : null}
          </div>
          {trailing}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export { Group, Row, Section }
