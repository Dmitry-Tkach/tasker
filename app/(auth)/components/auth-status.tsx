"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/** Logo + title block shared by the password recovery forms (matches login/register). */
export function AuthHeader({ subtitle }: { subtitle: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Image
        src="/multiple-defenses-svgrepo-com.svg"
        width={100}
        height={100}
        alt="logo"
      />
      <h1 className="text-2xl font-bold">Tasker</h1>
      <p className="text-balance text-muted-foreground">{subtitle}</p>
    </div>
  )
}

interface AuthStatusProps {
  icon: LucideIcon
  title: string
  tone?: "success" | "warning"
  children?: React.ReactNode
}

/**
 * Result panel (e.g. "Check your inbox"). Moves focus to its heading on mount
 * so keyboard and screen reader users land on the new content.
 */
export function AuthStatus({ icon: Icon, title, tone = "success", children }: AuthStatusProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        aria-hidden="true"
        className={cn(
          "flex size-14 items-center justify-center rounded-full ring-8 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:fade-in motion-safe:duration-300",
          tone === "success" && "bg-blue-600/10 text-blue-600 ring-blue-600/5",
          tone === "warning" && "bg-amber-500/10 text-amber-600 ring-amber-500/5"
        )}
      >
        <Icon className="size-7" strokeWidth={1.75} />
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-2xl font-bold outline-none"
      >
        {title}
      </h1>
      <div className="flex flex-col gap-2 text-balance text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
