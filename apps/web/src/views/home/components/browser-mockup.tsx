import {
  IconLock,
  IconPuzzleFilled,
  IconVolume,
} from "@tabler/icons-react"

import { cn } from "@workspace/ui/lib/utils"

import { MixerMockup } from "./mixer-mockup"

/**
 * A decorative browser window mock. Shows the Audio Tuner popup dropping down
 * from the extension's toolbar icon — the product shown in its real context.
 */
function BrowserMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full max-w-3xl overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-primary/10 ring-1 ring-foreground/5",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-red-400" />
          <span className="size-3 rounded-full bg-yellow-400" />
          <span className="size-3 rounded-full bg-green-400" />
        </div>

        <div className="mx-auto flex w-full max-w-md items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1">
          <IconLock className="size-3 shrink-0 text-muted-foreground" />
          <span className="truncate text-xs text-muted-foreground">
            youtube.com/watch
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="flex size-7 items-center justify-center rounded-md text-muted-foreground">
            <IconPuzzleFilled className="size-4" />
          </span>
          <span
            title="Audio Tuner"
            className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/30"
          >
            <IconVolume className="size-4" />
          </span>
        </div>
      </div>

      <div className="relative h-[400px] bg-background">
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col gap-4 p-6 opacity-50"
        >
          <div className="flex gap-4">
            <div className="aspect-video w-2/3 rounded-lg bg-muted" />
            <div className="flex flex-1 flex-col gap-2 pt-2">
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="mt-2 h-8 w-28 rounded-full bg-muted" />
            </div>
          </div>
          <div className="mt-2 flex gap-3">
            <div className="size-12 rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-5/6 rounded bg-muted" />
            </div>
          </div>
        </div>

        <div className="absolute right-3 top-2 shadow-xl shadow-primary/10">
          <MixerMockup />
        </div>
      </div>
    </div>
  )
}

export { BrowserMockup }
