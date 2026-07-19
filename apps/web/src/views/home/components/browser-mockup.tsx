"use client"

import { IconLock, IconPuzzleFilled } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { assets } from "@/assets"
import { siteConfig } from "@/configs/site-config"
import Image from "next/image"
import { MixerMockup } from "./mixer-mockup"

const cursorAnimationStyles = `
  @keyframes moveToExtension {
    from {
      transform: translate(50px, 50px);
      opacity: 1;
    }
    to {
      transform: translate(var(--cursor-end-x, 0px), var(--cursor-end-y, 0px));
      opacity: 1;
    }
  }
  
  @keyframes cursorClick {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.8);
    }
  }
`

/**
 * A decorative browser window mock. Shows the Audio Tuner popup dropping down
 * from the extension's toolbar icon — the product shown in its real context.
 */
function BrowserMockup({ className }: { className?: string }) {
  const [showCursor, setShowCursor] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 })
  const browserRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowCursor(true)
    }, 700)

    const timer2 = setTimeout(() => {
      setShowPopup(true)
    }, 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  useEffect(() => {
    if (showCursor && iconRef.current && browserRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect()
      const browserRect = browserRef.current.getBoundingClientRect()
      setCursorCoords({
        x: iconRect.left - browserRect.left,
        y: iconRect.top - browserRect.top,
      })
    }
  }, [showCursor])

  return (
    <>
      <style>{cursorAnimationStyles}</style>
      <div
        ref={browserRef}
        className={cn(
          "w-full max-w-3xl animate-in overflow-hidden rounded-xl border border-border/60 bg-card font-heading shadow-2xl ring-1 shadow-primary/10 ring-foreground/5 duration-700 fade-in slide-in-from-bottom-4",
          className
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
            ref={iconRef}
            title="Audio Tuner"
            className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/30"
          >
            <Image
              src={assets.logo}
              alt={siteConfig.brand.name}
              className="size-5"
            />
          </span>
        </div>
      </div>

      <div className="relative h-110 bg-background">
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

        <div className="absolute top-2 right-3">
          {showPopup && <MixerMockup />}
        </div>

        {showCursor && (
          <svg
            className="absolute pointer-events-none"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            style={{
              left: "50px",
              top: "50px",
              animation: `moveToExtension 1.2s ease-in-out forwards, cursorClick 0.3s ease-in-out 1.2s`,
              "--cursor-end-x": `${cursorCoords.x}px`,
              "--cursor-end-y": `${cursorCoords.y}px`,
            } as Record<string, string>}
          >
            <path
              d="M5 3L3 13L11 11L15 20L18 19L14 10L23 12Z"
              fill="currentColor"
              className="text-foreground drop-shadow-lg"
            />
          </svg>
        )}
      </div>
      </div>
    </>
  )
}

export { BrowserMockup }
