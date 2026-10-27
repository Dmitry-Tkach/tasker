"use client"

import Link from "next/link"
import { LogOutIcon, SettingsIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { useSignOut } from "../_hooks/use-sign-out"
import { initials } from "../_lib/initials"

interface UserMenuProps {
  name: string
  email: string
}

/** Avatar button in the top bar opening the account menu. */
export function UserMenu({ name, email }: UserMenuProps) {
  const { signOut, isPending } = useSignOut()
  const displayName = name || email

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={`Account menu for ${displayName}`}
          />
        }
      >
        <Avatar>
          <AvatarFallback className="bg-blue-600/10 text-xs font-semibold text-blue-700 dark:bg-blue-400/15 dark:text-blue-300">
            {initials(name, email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-2 font-normal">
            <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
            {name ? <span className="truncate text-xs text-muted-foreground">{email}</span> : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings" />}>
          <SettingsIcon aria-hidden="true" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          closeOnClick={false}
          onClick={signOut}
        >
          {isPending ? <Spinner aria-hidden="true" /> : <LogOutIcon aria-hidden="true" />}
          {isPending ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
