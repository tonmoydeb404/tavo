import {
  IconArrowRight,
  IconBookmarkPlus,
  IconPlayerStop,
} from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"

import { AppIcon, Group, Row, Section, VolumeSlider } from "@/components"
import type { AudioProcess, RouteEntry } from "@/types"

function ActiveRoutes({
  routes,
  processes,
  busy,
  onVolume,
  onStop,
  onStopAll,
  onRemember,
}: {
  routes: RouteEntry[]
  processes: AudioProcess[]
  busy: boolean
  onVolume: (pid: number, volume: number) => void
  onStop: (pid: number) => void
  onStopAll: () => void
  onRemember: (appName: string, targetUid: string, volume: number) => void
}) {
  return (
    <Section
      title={`Active routes · ${routes.length}`}
      action={
        <Button
          variant="ghost"
          size="xs"
          className="rounded-md text-destructive hover:text-destructive"
          disabled={busy}
          onClick={onStopAll}
        >
          Stop all
        </Button>
      }
    >
      <Group>
        {routes.map((route) => (
          <Row
            key={route.pid}
            leading={
              <AppIcon
                name={route.appName}
                path={processes.find((p) => p.pid === route.pid)?.appPath}
                playing
              />
            }
            title={route.appName}
            hint={
              <span className="flex items-center gap-1">
                <IconArrowRight className="size-3 shrink-0" />
                <span className="truncate">{route.targetName}</span>
              </span>
            }
            trailing={
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground"
                  disabled={busy}
                  title="Always route this app here"
                  aria-label={`Always route ${route.appName} to ${route.targetName}`}
                  onClick={() =>
                    onRemember(route.appName, route.targetUid, route.volume)
                  }
                >
                  <IconBookmarkPlus />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground"
                  disabled={busy}
                  title="Stop routing"
                  aria-label={`Stop routing ${route.appName}`}
                  onClick={() => onStop(route.pid)}
                >
                  <IconPlayerStop />
                </Button>
              </div>
            }
          >
            <VolumeSlider
              value={route.volume}
              onChange={(v) => onVolume(route.pid, v)}
              label={`${route.appName} volume`}
            />
          </Row>
        ))}
      </Group>
    </Section>
  )
}

export { ActiveRoutes }
