import {
  IconBluetooth,
  IconCast,
  IconDeviceAirpods,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconDeviceSpeaker,
  IconDeviceTv,
  IconHeadphones,
  IconHeadset,
  IconMicrophone,
  IconPlug,
  IconUsb,
} from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"

import { cn } from "@workspace/ui/lib/utils"

import type { AudioDeviceInfo } from "@/types"

const EARBUDS = /airpods|buds|earbud|tws|pods|\bwf-|freebuds|soundcore/
const HEADPHONES =
  /headphone|\bwh-|bose|beats|momentum|quietcomfort|\bqc\b|over-ear/
const HEADSET = /headset|\bhfp\b|\bcall\b/
const SPEAKER = /speaker|soundbar|boombox|homepod|\bjbl\b|echo|sonos/
const TV = /\btv\b|hdmi|television|samsung|\blg\b|sony/
const DISPLAY = /display|monitor|\bdell\b|\bacer\b|studio display/
const MICROPHONE = /microphone|\bmic\b|yeti|snowball|podcaster/
const VIRTUAL =
  /blackhole|loopback|soundflower|aggregate|multi-output|virtual|zoom|teams/

const GLYPHS = {
  bluetooth: IconBluetooth,
  cast: IconCast,
  deviceAirpods: IconDeviceAirpods,
  deviceDesktop: IconDeviceDesktop,
  deviceLaptop: IconDeviceLaptop,
  deviceSpeaker: IconDeviceSpeaker,
  deviceTv: IconDeviceTv,
  headphones: IconHeadphones,
  headset: IconHeadset,
  microphone: IconMicrophone,
  plug: IconPlug,
  usb: IconUsb,
} satisfies Record<string, Icon>

type GlyphKey = keyof typeof GLYPHS

// Best-effort icon for a device from its transport + name, so a built-in
// speaker, a Bluetooth earbud and a monitor are told apart at a glance.
function glyphKeyFor(
  device: AudioDeviceInfo,
  kind: "input" | "output"
): GlyphKey {
  const name = device.name.toLowerCase()
  const transport = device.transport

  if (transport === "Virtual" || VIRTUAL.test(name)) return "plug"
  if (EARBUDS.test(name)) return "deviceAirpods"
  if (HEADSET.test(name)) return "headset"
  if (HEADPHONES.test(name)) return "headphones"
  if (MICROPHONE.test(name) && kind === "input") return "microphone"

  switch (transport) {
    case "Built-in":
      if (kind === "input") return "microphone"
      if (/headphone/.test(name)) return "headphones"
      return /mac mini|imac|mac studio|mac pro/.test(name)
        ? "deviceDesktop"
        : "deviceLaptop"
    case "Bluetooth":
    case "Bluetooth LE":
      if (SPEAKER.test(name)) return "deviceSpeaker"
      return kind === "input" ? "headset" : "headphones"
    case "AirPlay":
      return SPEAKER.test(name) ? "deviceSpeaker" : "cast"
    case "DisplayPort":
    case "Thunderbolt":
      return TV.test(name) ? "deviceTv" : "deviceDesktop"
    case "USB":
      if (SPEAKER.test(name)) return "deviceSpeaker"
      if (DISPLAY.test(name)) return "deviceDesktop"
      return kind === "input" ? "microphone" : "usb"
    default:
      if (TV.test(name)) return "deviceTv"
      if (DISPLAY.test(name)) return "deviceDesktop"
      if (SPEAKER.test(name)) return "deviceSpeaker"
      return kind === "input" ? "microphone" : "bluetooth"
  }
}

// The bare device-type glyph.
function DeviceGlyph({
  device,
  kind,
  className,
}: {
  device: AudioDeviceInfo
  kind: "input" | "output"
  className?: string
}) {
  const Glyph = GLYPHS[glyphKeyFor(device, kind)]
  return <Glyph className={className} />
}

// Rounded tile with the device-type icon.
function DeviceIcon({
  device,
  kind,
  className,
}: {
  device: AudioDeviceInfo
  kind: "input" | "output"
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
        className
      )}
    >
      <DeviceGlyph device={device} kind={kind} className="size-[18px]" />
    </span>
  )
}

export { DeviceGlyph, DeviceIcon }
