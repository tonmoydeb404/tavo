"use client"

import {
  IconBattery3,
  IconBrandApple,
  IconCheck,
  IconMicrophone,
  IconMicrophoneOff,
  IconWifi,
} from "@tabler/icons-react"
import Image from "next/image"
import { useState } from "react"

import { assets } from "@/assets"
import { cn } from "@workspace/ui/lib/utils"

const inputs = ["MacBook Pro Microphone", "AirPods Pro", "USB Condenser Mic"]
const outputs = ["MacBook Pro Speakers", "AirPods Pro", "Studio Display"]

type Route = { app: string; device: string; active: boolean }

const initialRoutes: Route[] = [
  { app: "YouTube", device: "MacBook Pro Speakers", active: true },
  { app: "Zoom", device: "AirPods Pro", active: true },
]

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest text-white/45 uppercase">
      {children}
    </div>
  )
}

function MenuItem({
  checked,
  onClick,
  children,
}: {
  checked?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[13px] text-white/90 transition-colors hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:outline-none"
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {checked ? <IconCheck className="size-3.5" /> : null}
      </span>
      <span className="truncate">{children}</span>
    </button>
  )
}

/**
 * A clickable replica of the Tavo menu-bar menu, set on a faux macOS desktop.
 * State is local and purely illustrative — nothing here touches real audio.
 */
function TrayDemo({ className }: { className?: string }) {
  const [input, setInput] = useState(inputs[0])
  const [output, setOutput] = useState(outputs[0])
  const [muted, setMuted] = useState(false)
  const [routes, setRoutes] = useState(initialRoutes)
  const [status, setStatus] = useState("Click anything in the menu")

  function toggleRoute(app: string) {
    const route = routes.find((r) => r.app === app)
    if (!route) return
    setRoutes(
      routes.map((r) => (r.app === app ? { ...r, active: !r.active } : r))
    )
    setStatus(
      route.active
        ? `${app} → back to the default output`
        : `${app} → ${route.device}`
    )
  }

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_20%_100%,#ff7a45,transparent),radial-gradient(70%_80%_at_90%_10%,#6d28d9,transparent),linear-gradient(160deg,#2a1230,#13101c)]" />

      <div className="relative flex h-8 items-center justify-between bg-black/35 px-4 text-xs text-white/90 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <IconBrandApple className="size-4" />
          <span className="font-semibold">Finder</span>
          <span className="hidden gap-5 sm:flex">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Window</span>
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          {muted ? (
            <IconMicrophoneOff className="size-3.5 text-primary" />
          ) : (
            <IconMicrophone className="size-3.5" />
          )}
          <span className="flex size-5 items-center justify-center rounded bg-white/20">
            <Image src={assets.logo} alt="" width={14} />
          </span>
          <IconWifi className="hidden size-4 sm:block" />
          <IconBattery3 className="hidden size-4 sm:block" />
          <span>Fri 9:41</span>
        </div>
      </div>

      <div className="relative flex min-h-[26rem] flex-col justify-between gap-8 p-4 sm:min-h-[30rem] sm:flex-row sm:p-6">
        <div className="order-2 flex flex-col justify-end sm:order-1">
          <div
            role="status"
            aria-live="polite"
            className="w-fit max-w-xs rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs text-white/80 backdrop-blur-xl"
          >
            <span className="text-primary">▸</span> {status}
          </div>
        </div>

        <div className="order-1 w-full self-start rounded-xl border border-white/15 bg-neutral-900/80 p-1.5 shadow-2xl backdrop-blur-2xl sm:order-2 sm:max-w-[19rem]">
          <SectionLabel>Input</SectionLabel>
          {inputs.map((name) => (
            <MenuItem
              key={name}
              checked={input === name}
              onClick={() => {
                setInput(name)
                setStatus(`Input → ${name}`)
              }}
            >
              {name}
            </MenuItem>
          ))}

          <div className="my-1.5 h-px bg-white/10" />
          <SectionLabel>Output</SectionLabel>
          {outputs.map((name) => (
            <MenuItem
              key={name}
              checked={output === name}
              onClick={() => {
                setOutput(name)
                setStatus(`Output → ${name}`)
              }}
            >
              {name}
            </MenuItem>
          ))}

          <div className="my-1.5 h-px bg-white/10" />
          <SectionLabel>Routing</SectionLabel>
          {routes.map((route) => (
            <MenuItem
              key={route.app}
              checked={route.active}
              onClick={() => toggleRoute(route.app)}
            >
              {route.app} → {route.device.replace("MacBook Pro ", "")}
            </MenuItem>
          ))}

          <div className="my-1.5 h-px bg-white/10" />
          <button
            type="button"
            onClick={() => {
              setMuted(!muted)
              setStatus(muted ? "Microphone live" : "Microphone muted")
            }}
            className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-[13px] text-white/90 transition-colors hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:outline-none"
          >
            <span>{muted ? "Unmute microphone" : "Mute microphone"}</span>
            <span className="font-mono text-xs text-white/50">⌃⌥M</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export { TrayDemo }
