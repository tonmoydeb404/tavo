import { useCallback, useEffect, useState } from "react"

import { IconRefresh } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"

import { Group, Kbd, Row, Section } from "@/components"
import { api } from "@/lib/api"
import { brand } from "@/lib/brand"
import { displayName } from "@/lib/display-name"
import type { UpdateInfo } from "@/types"

const HOTKEYS = [
  ["⌥⌘M", "Mute or unmute the microphone"],
  ["⌥⌘↑", "Switch to the next microphone"],
  ["⌥⌘↓", "Switch to the next output"],
] as const

function SettingsView() {
  const [autostart, setAutostart] = useState<boolean | null>(null)
  const [update, setUpdate] = useState<UpdateInfo | null | undefined>(undefined)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    let mounted = true
    api
      .isAutostartEnabled()
      .then((enabled) => {
        if (mounted) setAutostart(enabled)
      })
      .catch(() => {
        if (mounted) setAutostart(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const toggleAutostart = useCallback((enabled: boolean) => {
    setAutostart(enabled) // optimistic
    void (enabled ? api.enableAutostart() : api.disableAutostart())
      .catch(() => setAutostart(!enabled))
      .finally(() => {
        void api.isAutostartEnabled().then(setAutostart)
      })
  }, [])

  const checkForUpdates = useCallback(() => {
    setChecking(true)
    api
      .checkForUpdate()
      .then(setUpdate)
      .catch(() => setUpdate(null))
      .finally(() => setChecking(false))
  }, [])

  return (
    <>
      <Section title="General">
        <Group>
          <Row
            title="Launch at login"
            hint="Starts quietly in the menu bar."
            trailing={
              <Switch
                checked={autostart === true}
                onCheckedChange={toggleAutostart}
                disabled={autostart === null}
                aria-label="Launch at login"
              />
            }
          />
        </Group>
      </Section>

      <Section
        title="Shortcuts"
        description="Work anywhere, even when Tavo is in the background."
      >
        <Group>
          {HOTKEYS.map(([keys, description]) => (
            <Row key={keys} title={description} trailing={<Kbd>{keys}</Kbd>} />
          ))}
        </Group>
      </Section>

      <Section title="About">
        <Group>
          <Row
            title={
              <span className="font-(family-name:--font-brand) text-base">
                {displayName}
              </span>
            }
            hint={`Version ${brand.version}`}
            trailing={
              update ? (
                <Button
                  size="sm"
                  className="rounded-lg"
                  onClick={() => void api.installUpdate()}
                >
                  Install update
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={checkForUpdates}
                  disabled={checking}
                >
                  <IconRefresh
                    data-icon="inline-start"
                    className={checking ? "animate-spin" : undefined}
                  />
                  {checking ? "Checking…" : "Check for updates"}
                </Button>
              )
            }
          />
          {update !== undefined ? (
            <Row
              title={
                update
                  ? `Version ${update.version} is available`
                  : "You're up to date"
              }
            />
          ) : null}
        </Group>
      </Section>
    </>
  )
}

export { SettingsView }
