/**
 * Central environment variable configuration.
 *
 * Every env var consumed by the app must be declared and validated here.
 * Do not read `process.env` directly anywhere else in the app.
 */

import { z } from "zod"

const envSchema = z.object({
  SITE_URL: z.url(),
  CHROME_STORE_URL: z.url(),
})

const parsed = envSchema.safeParse({
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  CHROME_STORE_URL: process.env.NEXT_PUBLIC_CHROME_STORE_URL,
})

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`
  )
}

export const envConfig = { ...parsed.data } as const

export type EnvConfig = typeof envConfig
