import { cn } from "@workspace/ui/lib/utils"

import { assets } from "@/assets"
import { brand } from "@workspace/brand"
import Image from "next/image"

/**
 * Inlined Tavo logo glyph. We render the SVG inline (rather than as an
 * `<img>`/`next/image`) so `html-to-image` can serialize the screenshot
 * reliably without worrying about asset URLs or CORS.
 */
function BrandMark({
  className,
  glyphClassName,
  showWordmark = true,
}: {
  className?: string
  glyphClassName?: string
  showWordmark?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl bg-background text-primary-foreground shadow-lg shadow-primary/30",
          glyphClassName
        )}
      >
        <Image src={assets.logo} alt="Brand logo" width={40} height={40} />
      </span>
      {showWordmark ? (
        <span className="font-heading text-2xl font-bold tracking-tight">
          {brand.name}
        </span>
      ) : null}
    </div>
  )
}

export { BrandMark }
