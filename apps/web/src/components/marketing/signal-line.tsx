import { cn } from "@workspace/ui/lib/utils"

/** A dashed connector with a dot travelling along it — audio on the move. */
function SignalLine({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative h-px min-w-10 flex-1 border-t border-dashed border-primary/50",
        className
      )}
    >
      <span className="signal-dot absolute -top-[3.5px] size-1.5 rounded-full bg-primary" />
    </div>
  )
}

export { SignalLine }
