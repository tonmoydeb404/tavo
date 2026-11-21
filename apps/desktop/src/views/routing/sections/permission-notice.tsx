import { IconExternalLink, IconRefresh } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"

import { Notice } from "@/components"

// Shown until System Audio Recording is granted. `detail` carries the
// backend's diagnostic suffix ("[probe: …]"), kept small for bug reports.
function PermissionNotice({
  detail,
  onOpenSettings,
  onRecheck,
}: {
  detail: string | null
  onOpenSettings: () => void
  onRecheck: () => void
}) {
  const diagnostic =
    detail && detail.includes("[")
      ? detail.slice(detail.indexOf("[") + 1, detail.lastIndexOf("]"))
      : null

  return (
    <Notice
      tone="warning"
      title="Allow system audio recording"
      actions={
        <>
          <Button size="sm" className="rounded-lg" onClick={onOpenSettings}>
            <IconExternalLink data-icon="inline-start" />
            Open System Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg"
            onClick={onRecheck}
          >
            <IconRefresh data-icon="inline-start" />
            I&rsquo;ve allowed it
          </Button>
        </>
      }
    >
      <p>
        macOS needs your permission before Tavo can redirect an app&rsquo;s
        audio. Turn Tavo on under Privacy &amp; Security, play sound in the app
        once so macOS can confirm it, then route again.
      </p>
      {diagnostic ? (
        <p className="mt-1.5 font-mono text-[10px] opacity-70">{diagnostic}</p>
      ) : null}
    </Notice>
  )
}

export { PermissionNotice }
