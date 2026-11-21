"use client"

import { IconCheck, IconCopy } from "@tabler/icons-react"
import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

type CopyCommandProps = {
  command: string
  className?: string
}

function CopyCommand({ command, className }: CopyCommandProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      className={cn(
        "w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-xl",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </span>
        <span className="font-mono text-xs text-muted-foreground">zsh</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <IconCheck className="size-3.5 text-primary" />
          ) : (
            <IconCopy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="w-max min-w-full px-5 py-5 pr-8 font-mono text-sm whitespace-nowrap">
          <span className="text-primary select-none">$ </span>
          {command}
        </div>
      </div>
    </div>
  )
}

export { CopyCommand }
