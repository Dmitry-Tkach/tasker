import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRightIcon, CalendarClockIcon, CircleCheckIcon, CircleDotIcon, InboxIcon } from "lucide-react"

import { requireUser } from "@/app/(auth)/_server/dal"
import { workspacePath } from "@/app/(app)/_lib/nav"
import { requireWorkspace } from "@/app/(workspaces)/_server/dal"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/app/(app)/_components/empty-state"
import { PageHeader } from "@/app/(app)/_components/page-header"
import { firstName } from "@/app/(app)/_lib/initials"

export const metadata: Metadata = {
  title: "Dashboard · Tasker",
}

// Placeholders until tasks have a data layer: no numbers are shown, only "—".
const STATS: { label: string; hint: string; icon: LucideIcon }[] = [
  { label: "Open", hint: "Tasks still to do", icon: CircleDotIcon },
  { label: "Due today", hint: "Needs attention today", icon: CalendarClockIcon },
  { label: "Completed", hint: "Done this week", icon: CircleCheckIcon },
]

export default async function DashboardPage({ params }: PageProps<"/w/[slug]">) {
  const { slug } = await params
  const user = await requireUser(workspacePath(slug))
  const workspace = await requireWorkspace(slug)
  const name = firstName(user.name)

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow={workspace.name}
        title={name ? `Welcome back, ${name}` : "Welcome back"}
        description="Here's where your week stands. Pick up where you left off or plan what's next."
      />

      <section aria-labelledby="stats-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="stats-heading" className="text-sm font-medium text-muted-foreground">
            At a glance
          </h2>
          <Badge variant="outline" className="text-muted-foreground">
            Placeholder data
          </Badge>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {STATS.map(({ label, hint, icon: Icon }) => (
            <li key={label}>
              <Card size="sm" className="h-full">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{label}</span>
                    <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    <span aria-hidden="true" className="text-muted-foreground/60">
                      —
                    </span>
                    <span className="sr-only">No data yet</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 id="recent-heading">Recent tasks</h2>
            </CardTitle>
            <CardDescription>The tasks you touched most recently.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={InboxIcon}
              headingLevel="h3"
              title="Nothing here yet"
              description="Once you start adding tasks, the latest ones will show up here."
              action={
                <Link href={workspacePath(workspace.slug, "/tasks")} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Go to Tasks
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              }
            />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
