import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { TermsView } from "@/views/terms"

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: {
    canonical: pathsConfig.terms,
  },
}

export default function Page() {
  return <TermsView />
}
