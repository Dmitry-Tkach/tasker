import type { Metadata } from "next"

import { requireUser } from "@/app/(auth)/_server/dal"
import { getWorkspaces } from "@/app/(workspaces)/_server/dal"
import { CreateWorkspaceForm } from "@/app/(workspaces)/components/create-workspace-form"

export const metadata: Metadata = {
  title: "Create your workspace · Tasker",
}

export default async function OnboardingPage() {
  await requireUser("/onboarding")
  // Also reached from the workspace switcher ("New workspace"), so users who
  // already have a workspace get a way back.
  const hasWorkspaces = (await getWorkspaces()).length > 0

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-10">
      <CreateWorkspaceForm isFirst={!hasWorkspaces} />
    </main>
  )
}
