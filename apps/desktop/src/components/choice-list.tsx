import { IconCheck } from "@tabler/icons-react"

import { cn } from "@workspace/ui/lib/utils"

type Choice = {
  key: string
  primary: string
  secondary?: string
  leading?: React.ReactNode
  disabled?: boolean
}

// Single-select list of rows (radio semantics) for devices, apps, targets.
// Meant to sit inside a <Group> — rows are divided by the group.
function ChoiceList({
  choices,
  selectedKey,
  onSelect,
  label,
}: {
  choices: Choice[]
  selectedKey: string | null
  onSelect: (key: string) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col">
      {choices.map((choice) => {
        const selected = choice.key === selectedKey
        return (
          <button
            key={choice.key}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={choice.disabled}
            onClick={() => onSelect(choice.key)}
            className={cn(
              "flex min-h-11 items-center gap-3 px-3 py-2 text-left transition-colors outline-none focus-visible:bg-muted",
              "not-disabled:hover:bg-muted/70",
              selected && "bg-primary/8",
              choice.disabled && "cursor-not-allowed opacity-45"
            )}
          >
            {choice.leading}
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={cn("truncate text-sm", selected && "font-medium")}
              >
                {choice.primary}
              </span>
              {choice.secondary ? (
                <span className="truncate text-xs text-muted-foreground">
                  {choice.secondary}
                </span>
              ) : null}
            </span>
            <IconCheck
              className={cn(
                "size-4 shrink-0 text-primary",
                !selected && "invisible"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export { ChoiceList }
export type { Choice }
