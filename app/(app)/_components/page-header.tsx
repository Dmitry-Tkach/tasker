import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  /** Small uppercase label above the title. */
  eyebrow?: string
  /** Buttons aligned to the right on wide screens. */
  actions?: React.ReactNode
  className?: string
}

/** The h1 block at the top of every signed-in page. */
export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow ? (
          <p className="font-mono text-xs font-medium tracking-widest text-blue-700 uppercase dark:text-blue-300">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-balance break-words sm:text-3xl">{title}</h1>
        {description ? <p className="max-w-prose text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}
