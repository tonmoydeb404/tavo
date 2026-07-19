import {
  IconBolt,
  IconBrandChrome,
  IconBrandGithubFilled,
  IconHeart,
  IconInfoCircle,
  IconLock,
  IconShield,
} from "@tabler/icons-react"
import Link from "next/link"

import { HeroSection } from "@/components/sections"
import { pathsConfig } from "@/configs/path-config"
import { siteConfig } from "@/configs/site-config"
import { buttonVariants } from "@workspace/ui/components/button"
import { IconCard } from "@workspace/ui/components/icon-card"
import { cn } from "@workspace/ui/lib/utils"

const values = [
  {
    icon: IconLock,
    title: "Privacy by default",
    body: "No servers, no analytics, no account. Per-tab settings live only in session storage and are wiped when the browser closes.",
  },
  {
    icon: IconBolt,
    title: "Fast and lightweight",
    body: "The extension is a tiny WXT bundle that uses native browser APIs. There is no background work, no telemetry, no cold start.",
  },
  {
    icon: IconShield,
    title: "Open and inspectable",
    body: "The whole project is open. You can read the source, audit the permissions, and rebuild it yourself if you want to.",
  },
  {
    icon: IconHeart,
    title: "Free, forever",
    body: "No paid tier, no trial, no upsell. Every feature — volume, boost, mic, and camera — is free, for everyone.",
  },
]

function AboutView() {
  return (
    <>
      <HeroSection
        badgeIcon={IconInfoCircle}
        badgeText="About"
        title={`About ${siteConfig.brand.name}`}
        description={`${siteConfig.brand.name} is a free, privacy-first media controller for your browser. It gives every tab its own volume, microphone, and webcam controls — mute and boost up to 400%, flip your mic or camera off — the per-tab controls the browser forgot to ship.`}
        primaryCta={{
          href: siteConfig.links.chromeStore,
          label: "Add to Chrome — free",
          icon: IconBrandChrome,
        }}
        secondaryCta={{
          href: siteConfig.links.github,
          label: "View on GitHub",
          icon: IconBrandGithubFilled,
        }}
      />
      <main className="container py-20">
        <div className="flex flex-col gap-12">
          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Why I built it
            </h2>
            <div className="flex flex-col gap-3 text-base leading-relaxed text-muted-foreground">
              <p>
                {siteConfig.brand.name} started the way a lot of small tools do:
                one specific annoyance. A quiet YouTube video that could not be
                heard over a fan. A meeting with a barely-audible caller. A mic
                you couldn&apos;t mute without digging through the call
                app&apos;s settings. A webcam a site kept on without asking
                again. The browser gave me no tools to fix any of these.
              </p>
              <p>
                System settings are the wrong level. They control the whole
                device. What I actually wanted was a set of controls for{" "}
                <em>each tab</em> — boost the quiet one, mute the loud one, flip
                the mic or camera off on the rest. So I built it with the Web
                Audio API for volume and per-tab media controls for the mic and
                webcam.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              What it stands for
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {values.map((value) => (
                <IconCard
                  key={value.title}
                  icon={value.icon}
                  title={value.title}
                  description={value.body}
                  size="sm"
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Who is behind it
            </h2>
            <div className="text-base leading-relaxed text-muted-foreground">
              <p>
                {siteConfig.brand.name} is built and maintained by{" "}
                <Link
                  href={siteConfig.developer.portfolio}
                  className="text-foreground underline underline-offset-4"
                >
                  {siteConfig.developer.name}
                </Link>
                , who uses the extension every day. There is no company behind
                it, no investors, and no roadmap aimed at monetising your
                attention. The project lives on{" "}
                <Link
                  href={siteConfig.links.github}
                  className="text-foreground underline underline-offset-4"
                >
                  GitHub
                </Link>{" "}
                and you can reach me directly at{" "}
                <a
                  href={`mailto:${siteConfig.links.email}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {siteConfig.links.email}
                </a>
                .
              </p>
            </div>
          </section>

          <section className="flex flex-col items-start gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Read more
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={pathsConfig.privacy}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Privacy policy
              </Link>
              <Link
                href={pathsConfig.help}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Help &amp; docs
              </Link>
              <Link
                href={pathsConfig.changelog}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Changelog
              </Link>
              <Link
                href={siteConfig.links.chromeStore}
                className={cn(buttonVariants())}
              >
                <IconBrandChrome className="size-4" />
                Add to Chrome
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export { AboutView }
