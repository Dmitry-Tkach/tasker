import { CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"

/** Form-level error (e.g. `errors.root?.server?.message`). Renders nothing without a message. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null

  return (
    <Alert variant="destructive">
      <CircleAlertIcon aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
