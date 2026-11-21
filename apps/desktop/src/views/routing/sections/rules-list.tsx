import { IconArrowRight, IconTrash } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"

import { AppIcon, Group, Row, Section } from "@/components"
import type { RuleEntry } from "@/types"

function RulesList({
  rules,
  busy,
  onToggle,
  onDelete,
}: {
  rules: RuleEntry[]
  busy: boolean
  onToggle: (id: number, enabled: boolean) => void
  onDelete: (id: number) => void
}) {
  return (
    <Section
      title="Always route"
      description="Tavo reroutes these apps automatically whenever they play."
    >
      <Group>
        {rules.map((rule) => (
          <Row
            key={rule.id}
            leading={<AppIcon name={rule.appName} />}
            title={rule.appName}
            hint={
              <span className="flex items-center gap-1">
                <IconArrowRight className="size-3 shrink-0" />
                <span className="truncate">{rule.targetName}</span>
              </span>
            }
            trailing={
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) => onToggle(rule.id, enabled)}
                  disabled={busy}
                  aria-label={`Auto-route ${rule.appName}`}
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground"
                  disabled={busy}
                  aria-label={`Delete rule for ${rule.appName}`}
                  onClick={() => onDelete(rule.id)}
                >
                  <IconTrash />
                </Button>
              </div>
            }
          />
        ))}
      </Group>
    </Section>
  )
}

export { RulesList }
