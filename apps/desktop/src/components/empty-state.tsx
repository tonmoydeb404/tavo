function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 py-8 text-center">
      <span className="mb-1 text-muted-foreground/60">{icon}</span>
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-xs text-balance text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export { EmptyState }
