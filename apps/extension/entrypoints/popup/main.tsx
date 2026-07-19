import "@workspace/ui/globals.css"
import React from "react"
import ReactDOM from "react-dom/client"
import "./fonts.css"

import { App } from "./app"

// Apply dark mode class based on system preference
function applyDarkMode() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  document.documentElement.classList.toggle("dark", isDark)
}

applyDarkMode()
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", applyDarkMode)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
