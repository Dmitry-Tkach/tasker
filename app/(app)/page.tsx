import type { Metadata } from "next"

import { requireUser } from "@/app/(auth)/_server/dal"

export const metadata: Metadata = {
  title: "Tasker",
}

export default async function Home() {
  const user = await requireUser("/")

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Welcome back{user.name ? `, ${user.name}` : ""}</h1>
      <p className="text-muted-foreground">Your tasks will appear here.</p>
    </div>
  )
}
