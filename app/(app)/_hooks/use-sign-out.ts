"use client"

import { useRouter } from "next/navigation"

import { useLogout } from "@/app/(auth)/_hooks/use-auth"

/** Logs out, then sends the user to /login and drops the cached signed-in UI. */
export function useSignOut() {
  const router = useRouter()
  const logoutMutation = useLogout()

  const signOut = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // The server clears the cookie even when Appwrite fails; if the request
      // itself failed, the protected pages will still send the user to login.
    }
    router.replace("/login")
    router.refresh()
  }

  return { signOut, isPending: logoutMutation.isPending }
}
