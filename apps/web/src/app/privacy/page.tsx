import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { PrivacyView } from "@/views/privacy"

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: {
    canonical: pathsConfig.privacy,
  },
}

export default function Page() {
  return <PrivacyView />
}
