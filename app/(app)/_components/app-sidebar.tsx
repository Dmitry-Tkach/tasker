"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { NAV_ITEMS, isActivePath, workspacePath } from "../_lib/nav"
import type { Workspace } from "@/app/(workspaces)/_lib/workspace"
import { WorkspaceSwitcher } from "./workspace-switcher"

// Brand-blue active state, matching the `primary` button variant.
const activeItemClass =
  "data-active:bg-blue-600/10 data-active:text-blue-700 data-active:hover:bg-blue-600/15 data-active:hover:text-blue-700 dark:data-active:bg-blue-400/15 dark:data-active:text-blue-300 dark:data-active:hover:text-blue-200"

export function AppSidebar({ workspace, workspaces }: { workspace: Workspace; workspaces: Workspace[] }) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  // The mobile sidebar is a modal sheet: close it once a link is followed.
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  // Tooltips only label the icon-only desktop rail. In the mobile sheet they'd
  // be hidden but still open on focus, swallowing the first Escape press.
  const tooltip = (label: string) => (isMobile ? undefined : label)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Main">
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const href = workspacePath(workspace.slug, item.path)
                  const active = isActivePath(pathname, workspace.slug, item.path)
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={tooltip(item.title)}
                        className={activeItemClass}
                        aria-current={active ? "page" : undefined}
                        render={<Link href={href} onClick={closeOnMobile} />}
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
