type Principle = {
  stat: string
  label: string
  description: string
}

const principles: Principle[] = [
  {
    stat: "$0",
    label: "Forever free",
    description: "No trial, no paywall on any control.",
  },
  {
    stat: "0",
    label: "Accounts",
    description: "Install it and use it. There's nothing to sign up for.",
  },
  {
    stat: "0 B",
    label: "Audio uploaded",
    description: "Settings stay on your device. Audio never leaves it.",
  },
  {
    stat: "100%",
    label: "Open source",
    description: "Extension and Mac app live in one public repository.",
  },
]

function PrinciplesSection() {
  return (
    <section className="container pb-24">
      <div className="grid overflow-hidden rounded-3xl border border-border bg-card sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((principle) => (
          <div
            key={principle.label}
            className="flex flex-col gap-3 border-b border-border p-8 last:border-b-0 sm:odd:border-r lg:border-r lg:border-b-0 lg:last:border-r-0"
          >
            <span className="font-heading text-6xl leading-none font-extrabold tracking-tighter text-primary">
              {principle.stat}
            </span>
            <span className="font-mono text-xs tracking-widest uppercase">
              {principle.label}
            </span>
            <p className="text-sm text-muted-foreground">
              {principle.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export { PrinciplesSection }
