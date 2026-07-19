import type { Metadata } from "next"

import { pathsConfig } from "@/configs/path-config"
import { HomeView } from "@/views/home"

export const metadata: Metadata = {
  alternates: {
    canonical: pathsConfig.home,
  },
}

export default function Page() {
  return <HomeView />
}
