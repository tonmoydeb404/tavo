/**
 * Central environment variable configuration.
 *
 * Every env var consumed by the app must be declared and validated here.
 * Do not read `process.env` directly anywhere else in the app.
 */

import { z } from "zod"

import { siteConfig } from "@/configs/site-config"

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().optional().default(siteConfig.brand.url),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`
  )
}

export const envConfig = {
  /** Public base URL of the site. Falls back to `siteConfig.brand.url` when unset. */
  siteUrl: parsed.data.NEXT_PUBLIC_SITE_URL,
} as const

export type EnvConfig = typeof envConfig
