import { useState } from "react"

import { IconChevronDown, IconSearch } from "@tabler/icons-react"

import { cn } from "@workspace/ui/lib/utils"

import { ChoiceList } from "./choice-list"
import type { Choice } from "./choice-list"

// A row showing the current pick; click to open a (searchable) list right
// underneath, pick one, it collapses. Sits inside a <Group>.
function SelectPanel({
  label,
  placeholder,
  choices,
  selectedKey,
  onSelect,
  searchable = false,
  emptyText = "Nothing to choose from",
}: {
  label: string
  placeholder: string
  choices: Choice[]
  selectedKey: string | null
  onSelect: (key: string) => void
  searchable?: boolean
  emptyText?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = choices.find((c) => c.key === selectedKey)
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? choices.filter((c) => c.primary.toLowerCase().includes(needle))
    : choices

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-14 items-center gap-3 px-3 py-2 text-left transition-colors outline-none hover:bg-muted/70 focus-visible:bg-muted"
      >
        {selected?.leading}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span
            className={cn(
              "truncate text-sm",
              selected ? "font-medium" : "text-muted-foreground"
            )}
          >
            {selected?.primary ?? placeholder}
          </span>
        </span>
        <IconChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="flex flex-col border-t border-border">
          {searchable && choices.length > 5 ? (
            <label className="flex items-center gap-2 border-b border-border px-3">
              <IconSearch className="size-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                aria-label={`Search ${label.toLowerCase()}`}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
          ) : null}
          <div className="max-h-64 overflow-y-auto">
            {visible.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              <ChoiceList
                label={label}
                choices={visible}
                selectedKey={selectedKey}
                onSelect={(key) => {
                  onSelect(key)
                  setOpen(false)
                  setQuery("")
                }}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { SelectPanel }
