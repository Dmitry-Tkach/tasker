import type { LucideIcon } from "lucide-react"
import { LayoutDashboardIcon, ListTodoIcon, SettingsIcon } from "lucide-react"

export type NavItem = {
  title: string
  href: "/" | "/tasks" | "/settings"
  icon: LucideIcon
}

/** Primary navigation for signed-in pages (sidebar + top bar title). */
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { title: "Tasks", href: "/tasks", icon: ListTodoIcon },
  { title: "Settings", href: "/settings", icon: SettingsIcon },
]

/** Whether `href` is the current page or one of its sub-pages. */
export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** The nav item for the current page, if any. */
export function activeNavItem(pathname: string) {
  return NAV_ITEMS.find((item) => isActivePath(pathname, item.href))
}
