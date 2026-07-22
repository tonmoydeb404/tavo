import { BrandMark } from "../components/brand-mark"

/**
 * 440x280 — Chrome Web Store "small promo tile".
 *
 * Compact brand mark on a saturated primary field. The eye lands on the
 * wordmark first, then the one-line promise, then the slider glyph as a
 * quiet product cue.
 */
function TileScreenshot() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground">
      {/* Soft highlight bloom in the top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-black/10 blur-2xl"
      />

      <BrandMark
        glyphClassName="size-12 bg-primary-foreground text-primary"
        className="relative text-primary-foreground [&_span]:text-primary-foreground"
      />

      <div className="relative">
        <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight">
          Per-tab volume,
          <br />
          mic &amp; webcam
        </h1>
        <p className="mt-2 text-sm text-primary-foreground/80">
          One toolbar. Every tab. Free for Chrome.
        </p>
      </div>
    </div>
  )
}

export { TileScreenshot }
