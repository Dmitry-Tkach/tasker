import type { Metadata } from "next"
import { ListTodoIcon, PlusIcon } from "lucide-react"

import { requireUser } from "@/app/(auth)/_server/dal"
import { Button } from "@/components/ui/button"
import { EmptyState } from "../_components/empty-state"
import { PageHeader } from "../_components/page-header"

export const metadata: Metadata = {
  title: "Tasks · Tasker",
}

export default async function TasksPage() {
  await requireUser("/tasks")

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
