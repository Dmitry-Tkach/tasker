import type { LucideIcon } from "lucide-react"
import { LayoutDashboardIcon, ListTodoIcon, SettingsIcon } from "lucide-react"

export type NavItem = {
  title: string
  /** Path inside the workspace; "" is the workspace dashboard. */
  path: "" | "/tasks" | "/settings"
  icon: LucideIcon
}

/** Primary navigation for workspace pages (sidebar + top bar title). */
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", path: "", icon: LayoutDashboardIcon },
  { title: "Tasks", path: "/tasks", icon: ListTodoIcon },
  { title: "Settings", path: "/settings", icon: SettingsIcon },
]

/** URL of a page in the workspace, e.g. workspacePath("acme", "/tasks") → "/w/acme/tasks". */
export function workspacePath(slug: string, path: NavItem["path"] = "") {
  return `/w/${encodeURIComponent(slug)}${path}`
}

/** Whether `path` (inside the workspace) is the current page or one of its sub-pages. */
export function isActivePath(pathname: string, slug: string, path: NavItem["path"]) {
  const href = workspacePath(slug, path)
  if (path === "") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** The nav item for the current page, if any. */
export function activeNavItem(pathname: string, slug: string) {
  return NAV_ITEMS.find((item) => isActivePath(pathname, slug, item.path))
}
