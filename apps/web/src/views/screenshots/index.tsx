"use client"

import { IconDownload } from "@tabler/icons-react"
import { useCallback, useRef, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  HeroScreenshot,
  BannerScreenshot,
  TileScreenshot,
  FeatureShot,
  featureShots,
} from "./sections"
import { ScreenshotFrame } from "./components"

type StoreShot = {
  id: string
  width: number
  height: number
  title: string
  subtitle: string
  filename: string
  render: () => React.ReactNode
}

const storeShots: StoreShot[] = [
  {
    id: "hero",
    width: 1280,
    height: 800,
    title: "Primary screenshot",
    subtitle: "Main store tile · 16:10",
    filename: "tavo-screenshot-1280x800.png",
    render: () => <HeroScreenshot />,
  },
  {
    id: "tile",
    width: 440,
    height: 280,
    title: "Small promo tile",
    subtitle: "List & search surfaces",
    filename: "tavo-promo-440x280.png",
    render: () => <TileScreenshot />,
  },
  {
    id: "banner",
    width: 1400,
    height: 560,
    title: "Marquee promo tile",
    subtitle: "Featured banner · 5:2",
    filename: "tavo-marquee-1400x560.png",
    render: () => <BannerScreenshot />,
  },
]

const FEATURE_WIDTH = 1280
const FEATURE_HEIGHT = 800

function ScreenshotsView() {
  // Refs keyed by shot id so "Download all" can capture each node in turn.
  const captureRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [downloadingAll, setDownloadingAll] = useState(false)

  const registerCapture = useCallback((id: string) => {
    return (node: HTMLDivElement | null) => {
      const map = captureRefs.current
      if (node) {
        map.set(id, node)
      } else {
        map.delete(id)
      }
    }
  }, [])

  const downloadNode = useCallback(
    async (
      node: HTMLDivElement,
      filename: string,
      width: number,
      height: number
    ) => {
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(node, {
        width,
        height,
        pixelRatio: 1,
        cacheBust: true,
        style: { transform: "none", margin: "0", inset: "auto" },
      })

      const link = document.createElement("a")
      link.download = filename
      link.href = dataUrl
      link.click()

      // Small delay so browsers don't drop multi-download sequences.
      await new Promise((resolve) => setTimeout(resolve, 350))
    },
    []
  )

  const handleDownloadAll = useCallback(async () => {
    if (downloadingAll) return
    setDownloadingAll(true)
    try {
      // Store assets first, then per-feature screenshots.
      for (const shot of storeShots) {
        const node = captureRefs.current.get(shot.id)
        if (!node) continue
        await downloadNode(node, shot.filename, shot.width, shot.height)
      }
      for (const shot of featureShots) {
        const node = captureRefs.current.get(shot.id)
        if (!node) continue
        await downloadNode(
          node,
          shot.filename,
          FEATURE_WIDTH,
          FEATURE_HEIGHT
        )
      }
    } finally {
      setDownloadingAll(false)
    }
  }, [downloadingAll, downloadNode])

  const totalAssets = storeShots.length + featureShots.length

  // ScreenshotFrame owns its capture ref, but we need to wire "Download all"
  // to those same nodes. We render ScreenshotFrame with a `captureRef`
  // callback so the parent can reach in without breaking the per-card
  // download UX.

  return (
    <main className="container pb-24 pt-32">
      <header className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium tracking-wide uppercase text-muted-foreground">
          Chrome Web Store
        </span>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Store screenshots
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Pixel-perfect promo assets for the Chrome Web Store listing. Each
          frame exports at its declared dimensions — exactly what the listing
          uploader expects.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-md bg-muted px-2 py-1 font-mono">
            {totalAssets} assets
          </span>
          <span aria-hidden="true">·</span>
          <span>PNG · 1×</span>
        </div>
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
          >
            <IconDownload className="size-4" />
            {downloadingAll ? "Exporting…" : "Download all"}
          </Button>
        </div>
      </header>

      <div className="mx-auto mt-16 flex max-w-5xl flex-col gap-10">
        <h2 className="font-heading sr-only">Store assets</h2>
        {storeShots.map((shot) => (
          <ScreenshotFrame
            key={shot.id}
            width={shot.width}
            height={shot.height}
            title={shot.title}
            subtitle={shot.subtitle}
            filename={shot.filename}
            captureRef={registerCapture(shot.id)}
          >
            {shot.render()}
          </ScreenshotFrame>
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-5xl">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Feature screenshots
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One shot per feature — drop these into the store listing&apos;s
              screenshot reel.
            </p>
          </div>
          <span className="hidden rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:inline">
            {featureShots.length} × 1280×800
          </span>
        </div>

        <div className="flex flex-col gap-10">
          {featureShots.map((config) => (
            <ScreenshotFrame
              key={config.id}
              width={FEATURE_WIDTH}
              height={FEATURE_HEIGHT}
              title={config.title}
              subtitle={config.subtitle}
              filename={config.filename}
              captureRef={registerCapture(config.id)}
            >
              <FeatureShot config={config} />
            </ScreenshotFrame>
          ))}
        </div>
      </div>
    </main>
  )
}

export { ScreenshotsView }
