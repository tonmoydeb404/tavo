import { IconAlertTriangle, IconX } from "@tabler/icons-react"

import { cn } from "@workspace/ui/lib/utils"

const TONES = {
  error: "border-destructive/25 bg-destructive/10 [&_svg]:text-destructive",
  warning: "border-warning/30 bg-warning/10 [&_svg]:text-warning",
} as const

// Inline banner for errors and "needs your attention" states.
function Notice({
  tone = "error",
  title,
  children,
  actions,
  onDismiss,
}: {
  tone?: keyof typeof TONES
  title?: string
  children?: React.ReactNode
  actions?: React.ReactNode
  onDismiss?: () => void
}) {
  return (
    <div
      role="alert"
      className={cn("flex gap-2.5 rounded-xl border px-3 py-2.5", TONES[tone])}
    >
      <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {title ? <p className="text-sm font-medium">{title}</p> : null}
        {children ? (
          <div className="text-xs text-muted-foreground">{children}</div>
        ) : null}
        {actions ? <div className="flex gap-2 pt-0.5">{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 h-fit shrink-0 rounded-md p-1 text-muted-foreground hover:bg-foreground/10"
        >
          <IconX className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}

export { Notice }
