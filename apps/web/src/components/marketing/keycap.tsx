import { cn } from "@workspace/ui/lib/utils"

type KeycapProps = {
  children: React.ReactNode
  className?: string
}

function Keycap({ children, className }: KeycapProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-b-4 border-border bg-card px-2.5 font-mono text-sm font-medium text-foreground shadow-sm",
        className
      )}
    >
      {children}
    </kbd>
  )
}

export { Keycap }
