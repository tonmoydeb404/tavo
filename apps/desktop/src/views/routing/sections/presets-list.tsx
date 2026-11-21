import { useState } from "react"

import { IconTrash } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"

import { Group, Row, Section } from "@/components"
import type { PresetEntry } from "@/types"

function PresetsList({
  presets,
  hasRoutes,
  busy,
  onSave,
  onApply,
  onDelete,
}: {
  presets: PresetEntry[]
  hasRoutes: boolean
  busy: boolean
  onSave: (name: string) => void
  onApply: (id: number) => void
  onDelete: (id: number) => void
}) {
  const [name, setName] = useState("")
  const canSave = name.trim().length > 0 && hasRoutes && !busy

  function save() {
    if (!canSave) return
    onSave(name.trim())
    setName("")
  }

  return (
    <Section
      title="Presets"
      description="Save your current routes as a one-click scene, like “Focus”."
    >
      <Group>
        {presets.map((preset) => (
          <Row
            key={preset.id}
            title={preset.name}
            hint={preset.rules
              .map((r) => `${r.appName} → ${r.targetName}`)
              .join(", ")}
            trailing={
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={busy}
                  onClick={() => onApply(preset.id)}
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground"
                  disabled={busy}
                  aria-label={`Delete preset ${preset.name}`}
                  onClick={() => onDelete(preset.id)}
                >
                  <IconTrash />
                </Button>
              </div>
            }
          />
        ))}
        <Row>
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              save()
            }}
          >
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={
                hasRoutes ? "Name this setup" : "Route an app to save a preset"
              }
              aria-label="Preset name"
              disabled={!hasRoutes}
              className="h-8 min-w-0 flex-1 rounded-lg border border-border bg-input/40 px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:opacity-50"
            />
            <Button
              type="submit"
              size="sm"
              className="rounded-lg"
              disabled={!canSave}
            >
              Save
            </Button>
          </form>
        </Row>
      </Group>
    </Section>
  )
}

export { PresetsList }
