import { cn } from "@workspace/ui/lib/utils"

// Letter tile standing in for an app icon, with an optional "playing" dot.
function AppAvatar({
  name,
  playing = false,
  className,
}: {
  name: string
  playing?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground",
        className
      )}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
      {playing ? (
        <span className="bg-success absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card" />
      ) : null}
    </span>
  )
}

export { AppAvatar }
