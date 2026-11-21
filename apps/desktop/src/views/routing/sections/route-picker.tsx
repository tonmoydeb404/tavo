import { useState } from "react"

import { IconCheck, IconChevronRight } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"

import { AppIcon, DeviceIcon, Group, Section, SelectPanel } from "@/components"
import { api } from "@/lib/api"
import type { AudioSnapshot, PickedApp } from "@/types"

// Pick any app with the system's own file panel (it doesn't have to be
// playing), pick where it should go, then one button that says what it will
// do. A playing app is routed right away; an idle one gets a saved
// "always route" rule that kicks in as soon as it makes sound.
function RoutePicker({
  snapshot,
  busy,
  onRoute,
  onAddRule,
}: {
  snapshot: AudioSnapshot
  busy: boolean
  onRoute: (pid: number, targetUid: string) => Promise<unknown>
  onAddRule: (
    appName: string,
    targetUid: string,
    volume: number
  ) => Promise<unknown>
}) {
  const [picked, setPicked] = useState<PickedApp | null>(null)
  const [targetUid, setTargetUid] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const targets = snapshot.devices.filter((d) => d.isOutput)
  const target = targets.find((d) => d.uid === targetUid)

  async function chooseApp() {
    const app = await api.pickApplication().catch(() => null)
    if (app) {
      setPicked(app)
      setMessage(null)
    }
  }

  async function route() {
    if (!picked || !target) return
    const routed = new Set(snapshot.routes.map((r) => r.pid))
    // Every process of the chosen app that is making sound (browsers play
    // from helper processes, so there can be several).
    const playing = snapshot.processes.filter(
      (p) =>
        p.audible &&
        !routed.has(p.pid) &&
        (p.appPath === picked.path ||
          p.name.toLowerCase() === picked.name.toLowerCase())
    )

    if (playing.length > 0) {
      for (const process of playing) {
        await onRoute(process.pid, target.uid)
      }
      setMessage(null)
    } else {
      await onAddRule(picked.name, target.uid, 1)
      setMessage(
        `${picked.name} will be sent to ${target.name} as soon as it plays sound.`
      )
    }
    setPicked(null)
    setTargetUid(null)
  }

  return (
    <Section
      title="Route an app"
      description="Send one app's sound to a specific output."
    >
      <Group>
        <button
          type="button"
          onClick={() => void chooseApp()}
          className="flex min-h-14 items-center gap-3 px-3 py-2 text-left transition-colors outline-none hover:bg-muted/70 focus-visible:bg-muted"
        >
          {picked ? (
            <AppIcon name={picked.name} path={picked.path} />
          ) : (
            <span className="size-8 shrink-0 rounded-lg border border-dashed border-border" />
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs text-muted-foreground">App</span>
            <span
              className={
                picked
                  ? "truncate text-sm font-medium"
                  : "truncate text-sm text-muted-foreground"
              }
            >
              {picked?.name ?? "Choose an app…"}
            </span>
          </span>
          <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>
        <SelectPanel
          label="Send to"
          placeholder="Choose an output"
          selectedKey={targetUid}
          onSelect={setTargetUid}
          choices={targets.map((d) => ({
            key: d.uid,
            primary: d.name,
            secondary: d.transport,
            leading: <DeviceIcon device={d} kind="output" />,
          }))}
        />
      </Group>
      <Button
        size="lg"
        className="w-full rounded-xl"
        disabled={!picked || !target || busy}
        onClick={() => void route()}
      >
        {picked && target
          ? `Route ${picked.name} to ${target.name}`
          : "Route app"}
      </Button>
      {message ? (
        <p className="flex items-start gap-1.5 px-1 text-xs text-muted-foreground">
          <IconCheck className="text-success mt-0.5 size-3.5 shrink-0" />
          {message}
        </p>
      ) : null}
    </Section>
  )
}

export { RoutePicker }
