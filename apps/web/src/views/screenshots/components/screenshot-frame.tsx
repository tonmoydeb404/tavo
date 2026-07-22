"use client"

import { IconDownload } from "@tabler/icons-react"
import { useCallback, useLayoutEffect, useRef, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type ScreenshotFrameProps = {
  width: number
  height: number
  title: string
  subtitle?: string
  filename: string
  className?: string
  /**
   * Optional parent-supplied ref callback. Receives the inner capture node
   * (the unscaled element at exact pixel dimensions) so a "Download all"
   * flow can reuse it.
   */
  captureRef?: (node: HTMLDivElement | null) => void
  children: React.ReactNode
}

/**
 * Renders a screenshot at its exact pixel dimensions and scales it down for
 * on-page preview. The download button uses `html-to-image` to capture the
 * unscaled node — Chrome Web Store requires the source PNG to match the
 * declared dimensions exactly (e.g. 1280x800, 440x280, 1400x560).
 *
 * The capture node is the inner div (which is unscaled); the outer wrapper
 * carries the CSS `transform: scale()` for display only.
 */
function ScreenshotFrame({
  width,
  height,
  title,
  subtitle,
  filename,
  className,
  captureRef,
  children,
}: ScreenshotFrameProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [busy, setBusy] = useState(false)

  // Keep the inner ref in sync with the parent's captureRef callback so
  // both the per-card button and the parent's "Download all" see the same
  // node even though React recreates it across renders.
  const setCaptureNode = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node
      captureRef?.(node)
    },
    [captureRef]
  )

  // Fit the screenshot into the available viewport width. Recomputed on
  // resize so previews stay responsive on any screen.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const compute = () => {
      const available = viewport.clientWidth
      setScale(available >= width ? 1 : available / width)
    }

    compute()

    const observer = new ResizeObserver(compute)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [width])

  const handleDownload = useCallback(async () => {
    const node = innerRef.current
    if (!node || busy) return

    setBusy(true)
    try {
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(node, {
        width,
        height,
        pixelRatio: 1,
        cacheBust: true,
        // Strip the preview-only transform so the exported PNG is full size.
        style: { transform: "none", margin: "0", inset: "auto" },
      })

      const link = document.createElement("a")
      link.download = filename
      link.href = dataUrl
      link.click()
    } finally {
      setBusy(false)
    }
  }, [busy, filename, width, height])

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-semibold tracking-tight">
              {title}
            </h2>
            <span className="rounded-md bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-border/60">
              {width}×{height}
            </span>
          </div>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <Button
          size="sm"
          onClick={handleDownload}
          disabled={busy}
          aria-label={`Download ${filename}`}
        >
          <IconDownload className="size-4" />
          {busy ? "Exporting…" : "Download PNG"}
        </Button>
      </header>

      <div
        ref={viewportRef}
        className="overflow-auto bg-[repeating-conic-gradient(var(--muted)_0%_25%,var(--background)_0%_50%)] bg-[length:24px_24px] p-6"
      >
        <div
          className="relative mx-auto"
          style={{ width: width * scale, height: height * scale }}
        >
          <div
            ref={setCaptureNode}
            className={cn("absolute left-0 top-0 origin-top-left", className)}
            style={{
              width,
              height,
              transform: `scale(${scale})`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

export { ScreenshotFrame }
