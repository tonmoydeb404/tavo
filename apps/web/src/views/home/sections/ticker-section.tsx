const items = [
  "Per-tab volume",
  "Boost to 400%",
  "Mute one tab",
  "Mic hotkey",
  "Webcam toggle",
  "Switch devices",
  "Route any app",
  "Launch at login",
]

function TickerSection() {
  const loop = [...items, ...items]

  return (
    <section
      aria-hidden="true"
      className="overflow-hidden border-y border-border bg-foreground py-4 text-background"
    >
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {loop.map((item, index) => (
          <span
            key={index}
            className="flex items-center gap-10 font-heading text-xl font-semibold tracking-tight"
          >
            {item}
            <span className="size-2 rounded-full bg-primary" />
          </span>
        ))}
      </div>
    </section>
  )
}

export { TickerSection }
