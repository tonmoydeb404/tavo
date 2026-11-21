import type { Metadata } from "next"
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Noto_Sans,
} from "next/font/google"

import { Providers } from "@/app/providers"
import { siteConfig } from "@/configs/site-config"
import { LayoutFooter, LayoutHeader } from "@/layout"
import "@workspace/ui/globals.css"

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

const fontHeading = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable} antialiased`}
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
