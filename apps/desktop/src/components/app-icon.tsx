import { useEffect, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/api"

import { AppAvatar } from "./app-avatar"

// Icons never change within a session: resolve each app once and share the
// in-flight promise between every place that shows it.
const cache = new Map<string, Promise<string | null>>()

function loadIcon(key: string) {
  let pending = cache.get(key)
  if (!pending) {
    pending = api.appIcon(key).catch(() => null)
    cache.set(key, pending)
  }
  return pending
}

// The app's real icon (from the system), falling back to a letter tile while
// loading or when the app has no resolvable bundle.
function AppIcon({
  name,
  path,
  playing = false,
  className,
}: {
  name: string
  /** `.app` bundle path when known; otherwise the icon is found by name. */
  path?: string | null
  playing?: boolean
  className?: string
}) {
  const key = path ?? name
  // Keyed by app so a changed `key` never shows the previous app's icon.
  const [loaded, setLoaded] = useState<{ key: string; url: string | null }>()

  useEffect(() => {
    let live = true
    void loadIcon(key).then((url) => {
      if (live) setLoaded({ key, url })
    })
    return () => {
      live = false
    }
  }, [key])

  const src = loaded?.key === key ? loaded.url : null

  if (!src)
    return <AppAvatar name={name} playing={playing} className={className} />

  return (
    <span className={cn("relative size-8 shrink-0", className)}>
      <img src={src} alt="" draggable={false} className="size-full" />
      {playing ? (
        <span className="bg-success absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-card" />
      ) : null}
    </span>
  )
}

export { AppIcon }
