// The app has no theme switch: light/dark always mirrors the macOS
// appearance. Toggles the `.dark` class (what the shared UI tokens key on)
// and stays in sync while the app is running.
export function syncSystemTheme() {
  const query = window.matchMedia("(prefers-color-scheme: dark)")
  const apply = () =>
    document.documentElement.classList.toggle("dark", query.matches)
  apply()
  query.addEventListener("change", apply)
}
