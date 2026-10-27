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
import { activeNavItem } from "../_lib/nav"

/** "Tasker / <Page>" in the top bar; just the page name on small screens. */
export function AppBreadcrumb() {
  const pathname = usePathname()
  const current = activeNavItem(pathname)

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="hidden sm:inline-flex">
          <BreadcrumbLink render={<Link href="/" />}>Tasker</BreadcrumbLink>
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
