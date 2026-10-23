"use client"

import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useLogout } from "@/app/(auth)/_hooks/use-auth"

export function LogoutButton() {
  const router = useRouter()
  const logoutMutation = useLogout()

  const onLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // The server clears the cookie even when Appwrite fails; if the request
      // itself failed, the protected pages will still send the user to login.
    }
    router.replace("/login")
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={onLogout} disabled={logoutMutation.isPending}>
      {logoutMutation.isPending ? <Spinner aria-hidden="true" /> : <LogOutIcon aria-hidden="true" />}
      Log out
    </Button>
  )
}
