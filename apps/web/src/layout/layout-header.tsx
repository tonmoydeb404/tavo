"use client"

import { IconMenu2 } from "@tabler/icons-react"
import Link from "next/link"
import * as React from "react"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { cn } from "@workspace/ui/lib/utils"

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: pathsConfig.privacy, label: "Privacy" },
]

const eqBars = [
  { delay: "0s", height: "h-2.5" },
  { delay: "0.2s", height: "h-4" },
  { delay: "0.4s", height: "h-3" },
  { delay: "0.15s", height: "h-2" },
]

function EqualizerMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 items-center justify-center rounded-full bg-primary"
    >
      <span className="flex h-4 items-end gap-0.5">
        {eqBars.map((bar) => (
          <span
            key={bar.delay}
            className={cn(
              "eq-bar w-0.5 rounded-full bg-primary-foreground",
              bar.height
            )}
            style={{ animationDelay: bar.delay }}
          />
        ))}
      </span>
    </span>
  )
}

export const LayoutHeader = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="fixed top-0 left-1/2 z-50 container -translate-x-1/2 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-full border border-border/60 bg-background/70 p-1.5 pl-4 shadow-lg backdrop-blur-xl supports-backdrop-filter:bg-background/55 sm:pl-5">
        <Link
          href={pathsConfig.home}
          className="flex items-center gap-2.5 rounded-full"
        >
          <EqualizerMark />
          <span className="text-base font-bold tracking-tight">
            {siteConfig.brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href={siteConfig.links.cta}
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden rounded-full sm:inline-flex"
            )}
          >
            Add to Chrome
          </Link>

          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full md:hidden"
                />
              }
            >
              <IconMenu2 className="size-5" />
              <span className="sr-only">Open menu</span>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{siteConfig.brand.name}</DrawerTitle>
              </DrawerHeader>
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <DrawerClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      />
                    }
                    nativeButton={false}
                  >
                    {link.label}
                  </DrawerClose>
                ))}
                <DrawerClose
                  render={
                    <Link
                      href={siteConfig.links.cta}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "mt-2 w-full"
                      )}
                    />
                  }
                  nativeButton={false}
                >
                  Add to Chrome
                </DrawerClose>
              </nav>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  )
}
