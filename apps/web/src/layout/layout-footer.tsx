import { IconBrandGithubFilled } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

import { assets } from "@/assets"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { brand } from "@workspace/brand"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

function browserRequestMailto(browser: string): string {
  const subject = encodeURIComponent(`${brand.name} — ${browser} support request`)
  const body = encodeURIComponent(
    `Hi, I'd love to use ${brand.name} on ${browser}. Please let me know when it's available.`
  )
  return `mailto:${siteConfig.links.email}?subject=${subject}&body=${body}`
}

const footerNav = [
  {
    title: "Features",
    links: [
      { href: pathsConfig.volumeBooster, label: "Volume Booster" },
      { href: pathsConfig.muteTab, label: "Mute Tab" },
      { href: pathsConfig.micToggle, label: "Mic Toggle" },
      { href: pathsConfig.webcamToggle, label: "Webcam Toggle" },
      { href: pathsConfig.mediaController, label: "Media Controller" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: pathsConfig.features, label: "Features" },
      { href: pathsConfig.faq, label: "FAQ" },
      { href: pathsConfig.help, label: "Help" },
      { href: pathsConfig.changelog, label: "Changelog" },
      { href: pathsConfig.about, label: "About" },
    ],
  },
  {
    title: "Browser",
    links: [
      { href: siteConfig.links.chromeStore, label: "Chrome" },
      { href: browserRequestMailto("Firefox"), label: "Firefox" },
      { href: browserRequestMailto("Edge"), label: "Edge" },
      { href: browserRequestMailto("Brave"), label: "Brave" },
    ],
  },
  {
    title: "Legals",
    links: [
      { href: pathsConfig.privacy, label: "Privacy" },
      { href: pathsConfig.terms, label: "Terms" },
    ],
  },
]

export const LayoutFooter = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-background">
      <div className="container pt-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <Link href={pathsConfig.home} className="flex items-center gap-2.5">
              <Image src={assets.logo} alt={siteConfig.brand.name} width={32} />
              <span className="font-heading text-xl font-bold tracking-tight">
                {siteConfig.brand.name}
              </span>
            </Link>
            <p className="mt-4 text-sm text-pretty text-muted-foreground">
              {siteConfig.brand.tagline}. Free and privacy-first — built for
              Chrome, Edge, and Brave.
            </p>
          </div>

          <Link
            href={siteConfig.links.github}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-fit shrink-0 rounded-full"
            )}
          >
            <IconBrandGithubFilled className="size-4" />
            Star on GitHub
          </Link>
        </div>

        <nav aria-label="Footer" className="mt-12">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-10 lg:gap-x-12">
            {footerNav.map((column) => (
              <div key={column.title}>
                <h3 className="flex items-center gap-2 font-heading text-xs tracking-wider text-foreground/80 uppercase">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-primary"
                  />
                  {column.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div
          aria-hidden="true"
          className="mt-14 flex h-10 items-end gap-0.75 text-primary/80"
        >
          {Array.from({ length: 64 }).map((_, i) => {
            const delay = (i * 137) % 900
            const duration = 800 + ((i * 53) % 700)
            return (
              <span
                key={i}
                className="eq-bar h-full flex-1 rounded-full bg-current"
                style={{
                  animationDelay: `${delay}ms`,
                  animationDuration: `${duration}ms`,
                }}
              />
            )
          })}
        </div>
      </div>

      <div className="container flex flex-col items-center justify-between gap-2 border-t border-border/60 py-5 text-xs text-muted-foreground sm:flex-row">
        <p>
          &copy; {year} {siteConfig.brand.name}. All rights reserved.
        </p>

        <p>
          Open source · Built by{" "}
          <Link
            href={siteConfig.developer.portfolio}
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            {siteConfig.developer.name}
          </Link>
        </p>
      </div>
    </footer>
  )
}
