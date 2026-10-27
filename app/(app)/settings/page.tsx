import type { Metadata } from "next"

import { requireUser } from "@/app/(auth)/_server/dal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "../_components/page-header"
import { initials } from "../_lib/initials"

export const metadata: Metadata = {
  title: "Settings · Tasker",
}

export default async function SettingsPage() {
  const user = await requireUser("/settings")

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" description="Your account details." />

      <section aria-labelledby="profile-heading" className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2 id="profile-heading">Profile</h2>
            </CardTitle>
            <CardDescription>Editing your profile isn&apos;t available yet.</CardDescription>
            <CardAction>
              <Avatar size="lg" aria-hidden="true">
                <AvatarFallback className="bg-blue-600/10 font-semibold text-blue-700 dark:bg-blue-400/15 dark:text-blue-300">
                  {initials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
            </CardAction>
          </CardHeader>
          <CardContent>
            <dl className="divide-y rounded-lg border text-sm">
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
                <dt className="font-medium text-muted-foreground">Name</dt>
                <dd className="min-w-0 break-words">
                  {user.name || <span className="text-muted-foreground">Not set</span>}
                </dd>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
                <dt className="font-medium text-muted-foreground">Email</dt>
                <dd className="min-w-0 break-all">{user.email}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
