import type { ComponentProps, ReactNode } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"

type TooltipButtonProps = ComponentProps<typeof Button> & {
  tooltip: ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

// A Button wrapped in a Base UI Tooltip. Use for icon-only buttons that need
// a hover hint; the tooltip reads from `tooltip`, while the button's
// accessible name still comes from `aria-label`. Disabled buttons still
// trigger the tooltip (modern browsers fire pointerenter on disabled form
// controls), which lets us explain *why* a button is unavailable.
function TooltipButton({
  tooltip,
  side = "top",
  ...props
}: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button {...props} />} />
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export { TooltipButton }
export type { TooltipButtonProps }
