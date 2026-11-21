import { useState } from "react"

import {
  IconAdjustmentsHorizontal,
  IconRoute,
  IconSettings,
} from "@tabler/icons-react"
import { cn } from "@workspace/ui/lib/utils"

import { AppLayout } from "@/layouts/app-layout"
import { HomeView } from "@/views/home"
import { RoutingView } from "@/views/routing"
import { SettingsView } from "@/views/settings"

type Tab = "devices" | "routing" | "settings"

const TABS = [
  { id: "devices", label: "Devices", icon: IconAdjustmentsHorizontal },
  { id: "routing", label: "Routing", icon: IconRoute },
  { id: "settings", label: "Settings", icon: IconSettings },
] as const

/**
 * Single-window shell. The tray is the quick surface; this window is where
 * you manage devices, per-app routing and preferences.
 */
export function App() {
  const [tab, setTab] = useState<Tab>("devices")

  return (
    <AppLayout
      nav={
        <nav
          aria-label="Sections"
          className="flex gap-0.5 rounded-lg bg-muted p-0.5"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={cn(
                "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                tab === id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </nav>
      }
    >
      {tab === "devices" ? <HomeView /> : null}
      {tab === "routing" ? <RoutingView /> : null}
      {tab === "settings" ? <SettingsView /> : null}
    </AppLayout>
  )
}
