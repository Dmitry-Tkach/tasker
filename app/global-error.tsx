"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { TriangleAlertIcon } from "lucide-react"

import "./globals.css"
import { Button } from "@/components/ui/button"
import { StatusPage } from "@/components/status-page"

// Replaces the root layout when it fails, so it renders its own <html>/<body>
// and imports the global styles itself. `metadata` isn't supported here.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <title>Something went wrong · Tasker</title>
        <StatusPage
          icon={TriangleAlertIcon}
          title="Something went wrong"
          description="Tasker failed to load. Please try again."
          actions={
            <Button variant="primary" onClick={() => retry()}>
              Try again
            </Button>
          }
          footer={
            error.digest && (
              <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
            )
          }
        />
      </body>
    </html>
  )
}
