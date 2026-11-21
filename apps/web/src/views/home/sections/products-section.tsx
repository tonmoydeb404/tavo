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
  icon: ComponentType<{ className?: string }>
  platform: string
  title: string
  description: string
  points: string[]
  primaryCta: { href: string; label: string }
  learnMore: { href: string; label: string }
}

const products: Product[] = [
  {
    id: "extension",
    icon: IconBrandChrome,
    platform: "Browser extension",
    title: "Per-tab control for Chrome",
    description:
      "Every tab gets its own volume, mic, and camera controls, right in your toolbar.",
    points: [
      "Mute a single tab, not the whole site",
      "Boost quiet audio up to 400%",
      "Mute your mic or camera in any call tab",
      "Works in Chrome, Edge, and Brave",
    ],
    primaryCta: { href: siteConfig.links.chromeStore, label: "Add to Chrome" },
    learnMore: { href: pathsConfig.extension, label: "Explore the extension" },
  },
  {
    id: "desktop",
    icon: IconBrandApple,
    platform: "macOS app",
    title: "System audio from your menu bar",
    description:
      "A lightweight menu-bar app that puts your Mac's audio devices and apps one click away.",
    points: [
      "Switch microphone and output in one click",
      "Mute your mic globally with a hotkey",
      "Route any app's audio to a specific device",
      "Launches at login, stays out of the way",
    ],
    primaryCta: { href: pathsConfig.desktop, label: "Get the Mac app" },
    learnMore: { href: pathsConfig.desktop, label: "Explore the Mac app" },
  },
]

function ProductsSection() {
  return (
    <section id="products" className="container py-20">
      <SectionHeading
        eyebrow="Products"
        title="Pick the one that fits — or use both"
        description="The extension controls audio inside your browser. The Mac app controls audio across your whole system. They work independently."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        {products.map((product) => {
          const Icon = product.icon
          return (
            <article
              key={product.id}
              className="flex flex-col rounded-2xl border border-border/60 bg-card p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  {product.platform}
                </span>
              </div>

              <h3 className="mt-6 font-heading text-2xl font-bold tracking-tight">
                {product.title}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {product.description}
              </p>

              <ul className="mt-6 flex flex-col gap-3 text-sm">
                {product.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <IconCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <Link
                  href={product.primaryCta.href}
                  className={cn(buttonVariants())}
                >
                  {product.primaryCta.label}
                </Link>
                <Link
                  href={product.learnMore.href}
                  className={cn(buttonVariants({ variant: "ghost" }))}
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
