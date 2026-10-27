"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { activeNavItem, workspacePath } from "../_lib/nav"

/** "<Workspace> / <Page>" in the top bar; just the page name on small screens. */
export function AppBreadcrumb({ workspaceName, slug }: { workspaceName: string; slug: string }) {
  const pathname = usePathname()
  const current = activeNavItem(pathname, slug)

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="hidden min-w-0 sm:inline-flex">
          <BreadcrumbLink className="truncate" render={<Link href={workspacePath(slug)} />}>
            {workspaceName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {current ? (
          <>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate font-medium">{current.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
