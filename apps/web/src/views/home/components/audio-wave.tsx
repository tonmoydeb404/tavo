import { cn } from "@workspace/ui/lib/utils"

type AudioWaveProps = {
  bars?: number
  className?: string
  barClassName?: string
}

/**
 * A decorative row of animated equalizer bars. Pure CSS animation
 * (see `.eq-bar` in globals.css), paused for reduced-motion users.
 */
function AudioWave({
  bars = 28,
  className,
  barClassName,
}: AudioWaveProps) {
  return (
    <div
      className={cn(
        "flex h-10 items-end gap-[3px]",
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => {
        const delay = (i * 137) % 900
        const duration = 800 + ((i * 53) % 700)
        return (
          <span
            key={i}
            className={cn(
              "eq-bar h-full w-[3px] flex-1 rounded-full bg-current",
              barClassName,
            )}
            style={{
              animationDelay: `${delay}ms`,
              animationDuration: `${duration}ms`,
            }}
          />
        )
      })}
    </div>
  )
}

export { AudioWave }
