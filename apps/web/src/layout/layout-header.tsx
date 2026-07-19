"use client"

import { IconMenu2 } from "@tabler/icons-react"
import Link from "next/link"
import * as React from "react"

import { assets } from "@/assets"
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
import Image from "next/image"

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: pathsConfig.privacy, label: "Privacy" },
]

export const LayoutHeader = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="fixed top-0 left-1/2 z-50 container -translate-x-1/2 px-3 pt-3 sm:pt-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-full border border-border/60 bg-background/70 px-4 py-3 shadow-lg backdrop-blur-xl supports-backdrop-filter:bg-background/55">
        <Link
          href={pathsConfig.home}
          className="flex items-center gap-2.5 rounded-full"
        >
          <Image src={assets.logo} alt={siteConfig.brand.name} width={30} />
          <span className="font-heading text-xl font-bold tracking-tight">
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
