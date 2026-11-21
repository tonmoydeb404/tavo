import { IconCheck } from "@tabler/icons-react"

import { cn } from "@workspace/ui/lib/utils"

type MenuRow =
  | { type: "header"; label: string }
  | { type: "item"; label: string; checked?: boolean }
  | { type: "separator" }

const rows: MenuRow[] = [
  { type: "header", label: "Input — MacBook Pro Microphone" },
  { type: "item", label: "MacBook Pro Microphone", checked: true },
  { type: "item", label: "AirPods Pro" },
  { type: "item", label: "USB Condenser Mic" },
  { type: "separator" },
  { type: "header", label: "Output — MacBook Pro Speakers" },
  { type: "item", label: "MacBook Pro Speakers", checked: true },
  { type: "item", label: "AirPods Pro" },
  { type: "separator" },
  { type: "header", label: "Routing" },
  { type: "item", label: "YouTube → Speakers  (click to stop)", checked: true },
  { type: "item", label: "Zoom → AirPods Pro  (click to stop)", checked: true },
  { type: "separator" },
  { type: "item", label: "Open Tavo" },
  { type: "item", label: "Quit Tavo" },
]

/**
 * A decorative, static mock of the Tavo menu-bar menu. Mirrors the real tray
 * menu layout: input and output devices, active routes, then app actions.
 */
function TrayMockup({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-2xl",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/60 px-4 py-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Tavo</span>
        <span>Menu bar</span>
      </div>

      <ul className="flex flex-col p-2 text-sm">
        {rows.map((row, index) => {
          if (row.type === "separator") {
            return (
              <li
                key={index}
                role="presentation"
                className="my-1.5 h-px bg-border/60"
              />
            )
          }

          if (row.type === "header") {
            return (
              <li
                key={index}
                className="px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {row.label}
              </li>
            )
          }

          return (
            <li
              key={index}
              className="flex items-center gap-2 rounded-md px-3 py-1.5"
            >
              <span className="flex size-4 shrink-0 items-center justify-center text-primary">
                {row.checked ? <IconCheck className="size-4" /> : null}
              </span>
              <span className="truncate">{row.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { TrayMockup }
