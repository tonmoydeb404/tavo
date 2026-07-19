"use client"

import { IconLock, IconPuzzleFilled } from "@tabler/icons-react"
import {
  animate,
  motion,
  useMotionValue,
  type AnimationPlaybackControls,
} from "motion/react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { assets } from "@/assets"
import { siteConfig } from "@/configs/site-config"
import { MixerMockup } from "./mixer-mockup"

const CURSOR_SIZE = 20

/**
 * A decorative browser window mock. Shows the Audio Tuner popup dropping down
 * from the extension's toolbar icon — the product shown in its real context.
 *
 * Animation sequence:
 * 1. Browser fades + slides in
 * 2. Cursor appears and moves to the extension icon
 * 3. Cursor clicks (scale pulse)
 * 4. Popup fades in (and the cursor fades out)
 */
function BrowserMockup({ className }: { className?: string }) {
  const browserRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const cursorScale = useMotionValue(1)
  const cursorOpacity = useMotionValue(0)
  const popupOpacity = useMotionValue(0)
  const popupY = useMotionValue(12)

  // Icon center relative to the browser container, measured after layout so
  // the cursor can travel to the actual icon position. Null until measured.
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const browserEl = browserRef.current
    const iconEl = iconRef.current
    if (!browserEl || !iconEl) return

    const browserRect = browserEl.getBoundingClientRect()
    const iconRect = iconEl.getBoundingClientRect()

    setTarget({
      x: iconRect.left - browserRect.left + iconRect.width / 2 - CURSOR_SIZE / 2,
      y: iconRect.top - browserRect.top + iconRect.height / 2 - CURSOR_SIZE / 2,
    })

    // Start the cursor somewhere natural inside the page area.
    cursorX.set(browserRect.width * 0.4)
    cursorY.set(browserRect.height * 0.72)
  }, [cursorX, cursorY])

  useEffect(() => {
    if (!target) return

    const controls: AnimationPlaybackControls[] = []
    let cancelled = false

    const run = async () => {
      const fadeIn = animate(cursorOpacity, 1, { duration: 0.2, delay: 0.8 })
      controls.push(fadeIn)
      await fadeIn.finished
      if (cancelled) return

      const moveX = animate(cursorX, target.x, {
        duration: 1,
        ease: "easeInOut",
      })
      const moveY = animate(cursorY, target.y, {
        duration: 1,
        ease: "easeInOut",
      })
      controls.push(moveX, moveY)
      await Promise.all([moveX.finished, moveY.finished])
      if (cancelled) return

      const press = animate(cursorScale, 0.75, { duration: 0.1 })
      controls.push(press)
      await press.finished
      if (cancelled) return

      const release = animate(cursorScale, 1, { duration: 0.1 })
      controls.push(release)
      await release.finished
      if (cancelled) return

      const popOpacity = animate(popupOpacity, 1, {
        duration: 0.35,
        ease: "easeOut",
      })
      const popY = animate(popupY, 0, { duration: 0.35, ease: "easeOut" })
      const cursorOut = animate(cursorOpacity, 0, {
        duration: 0.3,
        ease: "easeOut",
      })
      controls.push(popOpacity, popY, cursorOut)
    }

    void run()

    return () => {
      cancelled = true
      controls.forEach((c) => c.stop())
    }
  }, [
    target,
    cursorOpacity,
    cursorX,
    cursorY,
    cursorScale,
    popupOpacity,
    popupY,
  ])

  return (
    <motion.div
      ref={browserRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={cn(
        "relative w-full max-w-3xl overflow-hidden rounded-xl border border-border/60 bg-card font-heading shadow-2xl ring-1 shadow-primary/10 ring-foreground/5",
        className
      )}
    >
      {/* Toolbar */}
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

      {/* Page content skeleton */}
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

        {/* Popup */}
        <motion.div
          className="absolute right-3 top-2"
          style={{ opacity: popupOpacity, y: popupY }}
        >
          <MixerMockup />
        </motion.div>
      </div>

      {/*
        Cursor is a direct child of the browser container (not the page
        content) so its x/y motion values share the browser's coordinate
        system and can actually reach the toolbar icon.
      */}
      <motion.div
        className="pointer-events-none absolute left-0 top-0 z-10"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: cursorOpacity,
          scale: cursorScale,
        }}
      >
        <svg
          width={CURSOR_SIZE}
          height={CURSOR_SIZE}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          <path
            d="M3 3 L3 15 L6 12 L8 17 L10 16 L7.5 11 L12 11 Z"
            fill="white"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

export { BrowserMockup }
