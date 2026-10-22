import type { Metadata } from "next"
import Link from "next/link"
import { CompassIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { StatusPage } from "@/components/status-page"

export const metadata: Metadata = {
  title: "Page not found · Tasker",
}

export default function NotFound() {
  return (
    <StatusPage
      icon={CompassIcon}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      actions={
        <Link href="/" className={buttonVariants({ variant: "primary" })}>
          Go to home
        </Link>
      }
    />
  )
}
