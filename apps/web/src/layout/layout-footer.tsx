import { IconWaveSquare } from "@tabler/icons-react"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import Link from "next/link"

export const LayoutFooter = () => {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center sm:px-6">
        <Link href={pathsConfig.home} className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconWaveSquare className="size-4" />
          </span>
          <span className="font-bold tracking-tight">
            {siteConfig.brand.name}
          </span>
        </Link>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-muted-foreground sm:grid-cols-3 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-6 md:gap-y-2">
          <Link
            href={pathsConfig.volumeBooster}
            className="transition-colors hover:text-foreground"
          >
            Volume Booster
          </Link>
          <Link
            href={pathsConfig.muteTab}
            className="transition-colors hover:text-foreground"
          >
            Mute Tab
          </Link>
          <Link
            href={pathsConfig.micToggle}
            className="transition-colors hover:text-foreground"
          >
            Mic Toggle
          </Link>
          <Link
            href={pathsConfig.webcamToggle}
            className="transition-colors hover:text-foreground"
          >
            Webcam Toggle
          </Link>
          <Link
            href={pathsConfig.mediaController}
            className="transition-colors hover:text-foreground"
          >
            Media Controller
          </Link>
          <Link
            href={pathsConfig.features}
            className="transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href={pathsConfig.faq}
            className="transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
          <Link
            href={pathsConfig.help}
            className="transition-colors hover:text-foreground"
          >
            Help
          </Link>
          <Link
            href={pathsConfig.changelog}
            className="transition-colors hover:text-foreground"
          >
            Changelog
          </Link>
          <Link
            href={pathsConfig.about}
            className="transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            href={pathsConfig.privacy}
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href={pathsConfig.terms}
            className="transition-colors hover:text-foreground"
          >
            Terms
          </Link>
        </nav>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.brand.name}. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}
