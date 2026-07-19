"use client"

import { useCallback, useRef, type KeyboardEvent } from "react"

// Arrow-key navigation for a group of buttons inside a `role="toolbar"`
// container. Pressing ArrowRight / ArrowLeft moves focus between enabled
// buttons (disabled ones are skipped), matching the WAI-ARIA toolbar pattern.
function useToolbarKeyboardNav() {
  const ref = useRef<HTMLDivElement>(null)

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    const root = ref.current
    if (!root) return

    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>("button:not([disabled])")
    )
    if (buttons.length === 0) return

    const currentIndex = buttons.findIndex(
      (btn) => btn === document.activeElement
    )
    if (currentIndex === -1) return

    event.preventDefault()
    const dir = event.key === "ArrowRight" ? 1 : -1
    const next = (currentIndex + dir + buttons.length) % buttons.length
    buttons[next]?.focus()
  }, [])

  return { ref, onKeyDown }
}

export { useToolbarKeyboardNav }
