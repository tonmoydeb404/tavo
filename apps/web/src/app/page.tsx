import Link from "next/link"

import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: pathsConfig.home,
  },
}

export default function Page() {
  return (
    <main className="flex min-h-[calc(100svh-8rem)] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {siteConfig.brand.name}
      </h1>
      <p className="max-w-md text-muted-foreground">
        {siteConfig.brand.tagline}
      </p>
      <div className="flex items-center gap-4 text-sm">
        <Link
          href={pathsConfig.privacy}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Privacy Policy
        </Link>
        <Link
          href={pathsConfig.terms}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Terms of Service
        </Link>
      </div>
    </main>
  )
}
