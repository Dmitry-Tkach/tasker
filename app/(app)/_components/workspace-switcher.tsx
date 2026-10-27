"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react"

import type { Workspace } from "@/app/(workspaces)/_lib/workspace"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import { activeNavItem, workspacePath } from "../_lib/nav"
import { WorkspaceAvatar } from "./workspace-avatar"

interface WorkspaceSwitcherProps {
  current: Workspace
  /** All of the user's workspaces, including `current`. */
  workspaces: Workspace[]
}

/** Sidebar header button showing the current workspace; opens a menu to switch or create one. */
export function WorkspaceSwitcher({ current, workspaces }: WorkspaceSwitcherProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  // Switching keeps you on the same page (e.g. Tasks) in the other workspace.
  const page = activeNavItem(pathname, current.slug)?.path ?? ""

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className="h-10 gap-2.5 px-1 group-data-[collapsible=icon]:p-1! data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
            aria-label={`Current workspace: ${current.name}. Switch workspace`}
          />
        }
      >
        <WorkspaceAvatar name={current.name} imageUrl={current.imageUrl} className="size-8" />
        <span className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">{current.name}</span>
        <ChevronsUpDownIcon aria-hidden="true" className="ml-auto size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side={isMobile ? "bottom" : "right"}
        className="w-64 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
          {workspaces.map((workspace) => {
            const isCurrent = workspace.id === current.id
            return (
              <DropdownMenuItem
                key={workspace.id}
                aria-current={isCurrent ? "page" : undefined}
                onClick={closeOnMobile}
                render={<Link href={workspacePath(workspace.slug, page)} />}
              >
                <WorkspaceAvatar name={workspace.name} imageUrl={workspace.imageUrl} size="sm" />
                <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
                {isCurrent ? <CheckIcon aria-hidden="true" className="ml-auto" /> : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={closeOnMobile} render={<Link href="/onboarding" />}>
          <span className="flex size-6 items-center justify-center rounded-md border bg-background">
            <PlusIcon aria-hidden="true" className="size-3.5" />
          </span>
          New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
