import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import Link from "next/link"

type Props = {}

export const LayoutFooter = (props: Props) => {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href={pathsConfig.privacy}
            className="transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href={pathsConfig.terms}
            className="transition-colors hover:text-foreground"
          >
            Terms of Service
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.brand.name}. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}
