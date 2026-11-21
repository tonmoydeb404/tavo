import "@workspace/ui/globals.css"
import "./fonts.css"
import "./styles.css"

import React from "react"
import ReactDOM from "react-dom/client"

import { App } from "./app"
import { displayName } from "./lib/display-name"
import { syncSystemTheme } from "./lib/system-theme"

// Window title carries the env postfix ("Tavo Dev" in dev) — the Rust side
// sets the native title too; this keeps the document in sync.
document.title = displayName
syncSystemTheme()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
