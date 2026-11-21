// Desktop shell: a draggable toolbar holding the section switcher, then a
// scrollable content column. Sized for the compact portrait window.
export function AppLayout({
  nav,
  children,
}: {
  nav: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header
        data-tauri-drag-region
        className="shrink-0 border-b border-border bg-background/80 px-4 pt-2 pb-3 backdrop-blur"
      >
        {nav}
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-4 py-5">{children}</div>
      </main>
    </div>
  )
}
