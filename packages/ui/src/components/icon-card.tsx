import type { ComponentType, ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

type IconType = ComponentType<{ className?: string }>

type IconCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  icon: IconType
  title: ReactNode
  description?: ReactNode
  number?: number
  size?: "default" | "sm"
}

function IconCard({
  icon: Icon,
  title,
  description,
  number,
  size = "default",
  className,
  children,
  ...props
}: IconCardProps) {
  const isSm = size === "sm"

  return (
    <div
      data-slot="icon-card"
      data-size={size}
      className={cn(
        "relative flex flex-col rounded-2xl border border-border/60 bg-card p-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex items-center justify-center bg-primary/10 text-primary",
            isSm ? "size-10 rounded-xl" : "size-12 rounded-2xl"
          )}
        >
          <Icon className={isSm ? "size-5" : "size-6"} />
        </span>
        {number !== undefined && (
          <span className="font-heading text-5xl font-bold text-primary/15 dark:text-foreground/20">
            {number}
          </span>
        )}
      </div>
      <h3 className="font-heading mt-3 text-lg tracking-tight">{title}</h3>
      {description !== undefined && (
        <p
          className={cn(
            "mt-1 text-sm text-muted-foreground",
            isSm && "leading-relaxed"
          )}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  )
}

export { IconCard, type IconCardProps, type IconType }
