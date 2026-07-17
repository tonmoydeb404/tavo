import { useState } from "react"

import { Button } from "@workspace/ui/components/button"

export function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex w-full flex-col gap-3 p-4">
      <header>
        <h1 className="font-heading text-lg font-medium">Extension Name</h1>
        <p className="text-sm text-muted-foreground">
          Replace this popup with your own UI.
        </p>
      </header>

      <Button onClick={() => setCount((c) => c + 1)}>Count is {count}</Button>
    </div>
  )
}
