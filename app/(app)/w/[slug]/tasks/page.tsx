import type { Metadata } from "next"
import { ListTodoIcon, PlusIcon } from "lucide-react"

import { requireUser } from "@/app/(auth)/_server/dal"
import { workspacePath } from "@/app/(app)/_lib/nav"
import { requireWorkspace } from "@/app/(workspaces)/_server/dal"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/app/(app)/_components/empty-state"
import { PageHeader } from "@/app/(app)/_components/page-header"

export const metadata: Metadata = {
  title: "Tasks · Tasker",
}

export default async function TasksPage({ params }: PageProps<"/w/[slug]/tasks">) {
  const { slug } = await params
  await requireUser(workspacePath(slug, "/tasks"))
  await requireWorkspace(slug)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Tasks" description="Everything on your plate, in one list." />

      <EmptyState
        icon={ListTodoIcon}
        title="No tasks yet"
        description="Tasks you create will appear here. Creating tasks is coming soon."
        action={
          // Placeholder until tasks have an API; disabled so it can't look like it works.
          <Button variant="primary" disabled>
            <PlusIcon aria-hidden="true" />
            New task
          </Button>
        }
      />
    </div>
  )
}
