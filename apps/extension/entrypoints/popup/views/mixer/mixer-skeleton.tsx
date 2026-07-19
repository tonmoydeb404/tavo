// Skeleton shown while the popup's initial tab + state load completes.
// Mirrors the layout of MixerRow so the popup doesn't visually jump on hydrate.
function MixerSkeleton() {
  return (
    <div
      className="flex flex-col gap-2"
      role="status"
      aria-label="Loading tabs"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-center gap-2">
            <div className="size-4 animate-pulse rounded-sm bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-muted" />
          <div className="mt-3 flex gap-1">
            <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
            <div className="size-7 animate-pulse rounded-full bg-muted" />
            <div className="size-7 animate-pulse rounded-full bg-muted" />
            <div className="size-7 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export { MixerSkeleton }
