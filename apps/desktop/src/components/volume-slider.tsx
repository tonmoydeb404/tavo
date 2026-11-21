import type { ReactNode } from "react"

import { Slider } from "@workspace/ui/components/slider"

// Icon + slim slider + live percentage. `value` and `onChange` are 0–1.
function VolumeSlider({
  value,
  onChange,
  label,
  icon,
  disabled,
}: {
  value: number
  onChange: (value: number) => void
  label: string
  icon?: ReactNode
  disabled?: boolean
}) {
  const percent = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2.5">
      {icon ? (
        <span className="shrink-0 text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <Slider
        value={[percent]}
        max={100}
        step={1}
        disabled={disabled}
        onValueChange={(next) => {
          const v = Array.isArray(next) ? next[0] : next
          if (typeof v === "number") onChange(v / 100)
        }}
        aria-label={label}
        className="**:data-[slot=slider-track]:h-1.5"
      />
      <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {percent}%
      </span>
    </div>
  )
}

export { VolumeSlider }
