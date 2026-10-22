"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import Link from "next/link"
import { TriangleAlertIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { StatusPage } from "@/components/status-page"

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  // Never show error.message: it can contain internals (and is redacted for
  // server errors in production anyway). The digest matches the server logs.
  return (
    <StatusPage
      icon={TriangleAlertIcon}
      title="Something went wrong"
      description="An unexpected error occurred. Please try again."
      actions={
        <>
          <Button variant="primary" onClick={() => retry()}>
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Go to home
          </Link>
        </>
      }
      footer={
        error.digest && (
          <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
        )
      }
    />
  )
}
