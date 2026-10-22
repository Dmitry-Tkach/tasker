import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface StatusPageProps {
  icon: LucideIcon
  title: string
  description: React.ReactNode
  /** Buttons/links under the description. */
  actions: React.ReactNode
  footer?: React.ReactNode
}

/** Centered card for full-page states such as 404 and error boundaries. */
export function StatusPage({ icon: Icon, title, description, actions, footer }: StatusPageProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-100 p-0">
        <CardContent className="flex flex-col items-center gap-6 p-6 text-center md:p-8">
          <div
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 ring-8 ring-amber-500/5"
          >
            <Icon className="size-7" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-balance text-muted-foreground">{description}</p>
          </div>
          <div className="flex w-full flex-col gap-3">{actions}</div>
          {footer}
        </CardContent>
      </Card>
    </main>
  )
}
