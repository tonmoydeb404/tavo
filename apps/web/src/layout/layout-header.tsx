"use client"

import { IconMenu2, IconPuzzle } from "@tabler/icons-react"
import Link from "next/link"
import * as React from "react"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { Button } from "@workspace/ui/components/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"

const navLinks = [
  { href: pathsConfig.home, label: "Home" },
  { href: pathsConfig.privacy, label: "Privacy Policy" },
  { href: pathsConfig.terms, label: "Terms of Service" },
]

type Props = {}

export const LayoutHeader = (props: Props) => {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href={pathsConfig.home} className="flex items-center gap-2">
          <IconPuzzle className="size-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">
            {siteConfig.brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger
            render={
              <Button variant="ghost" size="icon" className="sm:hidden" />
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
            </nav>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  )
}
