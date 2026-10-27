import { Suspense } from "react"
import { cookies } from "next/headers"

import { getUser, requireUser } from "@/app/(auth)/_server/dal"
import { getWorkspaces, requireWorkspace } from "@/app/(workspaces)/_server/dal"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppBreadcrumb } from "../../_components/app-breadcrumb"
import { AppSidebar } from "../../_components/app-sidebar"
import { UserMenu } from "../../_components/user-menu"
import { workspacePath } from "../../_lib/nav"

// Shell for workspace pages. It loads the workspace to *display* it, but each
// page still enforces auth and membership itself (requireUser +
// requireWorkspace), because layouts don't re-render on navigation (see the
// Next auth guide).
export default async function WorkspaceLayout({ children, params }: LayoutProps<"/w/[slug]">) {
  const { slug } = await params
  await requireUser(workspacePath(slug))
  const [workspace, workspaces] = await Promise.all([requireWorkspace(slug), getWorkspaces()])

  // Written by SidebarProvider when the desktop sidebar is collapsed/expanded.
  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false"

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={sidebarOpen}>
        <a
          href="#main-content"
          className="sr-only rounded-md bg-background px-4 py-2 text-sm font-medium shadow-md ring-2 ring-ring focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>

        <AppSidebar workspace={workspace} workspaces={workspaces} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-backdrop-filter:bg-background/70 sm:px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 data-vertical:h-4 data-vertical:self-center" />
            <AppBreadcrumb workspaceName={workspace.name} slug={workspace.slug} />
            <div className="ml-auto flex shrink-0 items-center">
              <Suspense fallback={<Skeleton className="size-9 rounded-full" />}>
                <CurrentUserMenu settingsHref={workspacePath(workspace.slug, "/settings")} />
              </Suspense>
            </div>
          </header>

          <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}

/** Reads the user on the server and hands plain props to the client menu. */
async function CurrentUserMenu({ settingsHref }: { settingsHref: string }) {
  const user = await getUser()
  if (!user) return null

  return <UserMenu name={user.name} email={user.email} settingsHref={settingsHref} />
}
