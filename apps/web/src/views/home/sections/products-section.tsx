import {
  IconArrowRight,
  IconBrandApple,
  IconBrandChrome,
  IconCheck,
} from "@tabler/icons-react"
import Link from "next/link"
import type { ComponentType } from "react"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { SectionHeading } from "@/views/extension/components"

type Product = {
  id: string
  index: string
  icon: ComponentType<{ className?: string }>
  platform: string
  title: string
  description: string
  points: string[]
  primaryCta: { href: string; label: string }
  learnMore: { href: string; label: string }
  inverted?: boolean
}

const products: Product[] = [
  {
    id: "extension",
    index: "01",
    icon: IconBrandChrome,
    platform: "Browser extension",
    title: "Every tab gets its own knob.",
    description:
      "Volume, mic, and camera controls for each tab, right in your toolbar. For Chrome, Edge, and Brave.",
    points: [
      "Mute a single tab, not the whole site",
      "Boost quiet audio up to 400%",
      "Mute your mic or camera in any call tab",
      "Nothing leaves the browser",
    ],
    primaryCta: { href: siteConfig.links.chromeStore, label: "Add to Chrome" },
    learnMore: { href: pathsConfig.extension, label: "Explore the extension" },
  },
  {
    id: "desktop",
    index: "02",
    icon: IconBrandApple,
    platform: "macOS app",
    title: "Your Mac's sound, from the menu bar.",
    description:
      "A tiny menu-bar app for the audio controls macOS buries in System Settings. Built with Tauri, native to Apple Silicon.",
    points: [
      "Switch microphone and output in one click",
      "Mute your mic globally with a hotkey",
      "Route any app's audio to a specific device",
      "Launches at login, stays out of the way",
    ],
    primaryCta: { href: pathsConfig.desktop, label: "Get the Mac app" },
    learnMore: { href: pathsConfig.desktop, label: "Explore the Mac app" },
    inverted: true,
  },
]

function ProductsSection() {
  return (
    <section id="products" className="container pb-24">
      <SectionHeading
        eyebrow="Two tools"
        title="Pick the one that fits — or run both"
        description="The extension controls sound inside your browser. The Mac app controls sound across your whole system. They work independently."
      />

      <div className="mt-16 grid gap-4 lg:grid-cols-2">
        {products.map((product) => {
          const Icon = product.icon
          return (
            <article
              key={product.id}
              className={cn(
                "relative flex flex-col overflow-hidden rounded-3xl border border-border p-8 sm:p-10",
                product.inverted
                  ? "dark bg-background text-foreground"
                  : "bg-card"
              )}
            >
              <span
                aria-hidden="true"
                className="absolute -top-6 right-6 font-heading text-[10rem] leading-none font-extrabold tracking-tighter text-foreground/5 select-none"
              >
                {product.index}
              </span>

              <span className="relative flex w-fit items-center gap-2.5 rounded-full border border-border px-3 py-1.5 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                <Icon className="size-4 text-primary" />
                {product.platform}
              </span>

              <h3 className="relative mt-10 max-w-sm font-heading text-4xl font-bold tracking-tight text-balance">
                {product.title}
              </h3>
              <p className="relative mt-4 max-w-md text-muted-foreground">
                {product.description}
              </p>

              <ul className="relative mt-8 flex flex-col gap-3 text-sm">
                {product.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <IconCheck className="size-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="relative mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={product.primaryCta.href}
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  {product.primaryCta.label}
                </Link>
                <Link
                  href={product.learnMore.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" })
                  )}
                >
                  {product.learnMore.label}
                  <IconArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export { ProductsSection }
