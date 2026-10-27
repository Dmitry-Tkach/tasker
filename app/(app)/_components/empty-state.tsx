import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: React.ReactNode
  /** Heading level, so the empty state fits the page outline. */
  headingLevel?: "h2" | "h3"
  action?: React.ReactNode
  className?: string
}

/** Dashed panel shown where a list has nothing in it yet. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  headingLevel: Heading = "h2",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-blue-600/10 text-blue-700 ring-8 ring-blue-600/5 dark:bg-blue-400/15 dark:text-blue-300 dark:ring-blue-400/5"
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <Heading className="text-base font-semibold">{title}</Heading>
        <p className="text-sm text-balance text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
