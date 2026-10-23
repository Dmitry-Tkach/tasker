import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"

import { getUser } from "@/app/(auth)/_server/dal"
import { Skeleton } from "@/components/ui/skeleton"
import { LogoutButton } from "./_components/logout-button"

// Shell for signed-in pages. It only *displays* the user: each page enforces
// auth itself with requireUser(), because layouts don't re-render on
// navigation (see the Next auth guide).
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/multiple-defenses-svgrepo-com.svg" width={28} height={28} alt="" />
            Tasker
          </Link>
          <Suspense fallback={<Skeleton className="h-8 w-40" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">{children}</main>
    </div>
  )
}

async function UserMenu() {
  const user = await getUser()
  if (!user) return null

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">{user.name || user.email}</span>
      <LogoutButton />
    </div>
  )
}
