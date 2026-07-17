import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"

import { Providers } from "@/app/providers"
import { siteConfig } from "@/configs/site-config"
import { LayoutFooter, LayoutHeader } from "@/layout"
import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"

export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.titleDefault,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.description,
  metadataBase: new URL(siteConfig.brand.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.seo.ogTitle,
    description: siteConfig.seo.ogDescription,
    type: "website",
    url: siteConfig.brand.url,
    siteName: siteConfig.brand.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.ogTitle,
    description: siteConfig.seo.ogDescription,
  },
}

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", dmSans.variable)}
    >
      <body suppressHydrationWarning>
        <Providers>
          <LayoutHeader />
          {children}
          <LayoutFooter />
        </Providers>
      </body>
    </html>
  )
}
