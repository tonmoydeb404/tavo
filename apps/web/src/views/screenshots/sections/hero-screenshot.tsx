import { BrandMark } from "../components/brand-mark"
import { MixerMockup } from "@/views/home/components"

/**
 * 1280x800 — primary Chrome Web Store screenshot.
 *
 * Left: brand + product promise + control pillars.
 * Right: the real toolbar popup (the same `MixerRow` component the
 * extension ships) so shoppers recognize it the moment they install.
 */
function HeroScreenshot() {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Decorative blooms */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 size-[440px] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex w-full items-center justify-between gap-10 px-16">
        <div className="max-w-xl">
          <BrandMark glyphClassName="size-12" />
          <h1 className="mt-10 font-heading text-6xl font-bold leading-[1.05] tracking-tight text-balance">
            Every tab&apos;s{" "}
            <span className="text-primary">volume, mic</span> and{" "}
            <span className="text-primary">camera</span>
          </h1>
          <p className="mt-5 text-xl text-pretty text-muted-foreground">
            Mute one tab — not the whole site. Boost quiet audio up to 400%.
            Kill your mic or webcam from the toolbar. No accounts, no servers.
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {[
              "Per-tab volume",
              "0–400% boost",
              "Mic toggle",
              "Webcam toggle",
              "Private by default",
            ].map((feature) => (
              <li
                key={feature}
                className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm font-medium"
              >
                {feature}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm font-medium text-muted-foreground">
            Free · Chrome · Edge · Brave
          </p>
        </div>

        <MixerMockup />
      </div>
    </div>
  )
}

export { HeroScreenshot }
