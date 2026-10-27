import { redirect } from "next/navigation"

import { requireUser } from "@/app/(auth)/_server/dal"
import { getWorkspaces } from "@/app/(workspaces)/_server/dal"
import { workspacePath } from "./_lib/nav"

// "/" has no content of its own: it opens the user's first workspace, or the
// onboarding step when they don't have one yet.
export default async function HomePage() {
  await requireUser("/")
  const [first] = await getWorkspaces()
  redirect(first ? workspacePath(first.slug) : "/onboarding")
}
