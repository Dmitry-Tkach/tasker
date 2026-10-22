"use client"

import { useState } from "react"
import Link from "next/link"
import { Form, useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type * as z from "zod"
import { EyeIcon, EyeOffIcon, LinkIcon, ShieldCheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { applyServerError } from "@/lib/form-errors"
import { FormAlert } from "@/components/form/form-alert"
import { FormInput } from "@/components/form/form-input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { PASSWORD_MIN, resetPasswordFormSchema } from "../_lib/schemas"
import { useResetPassword } from "../_hooks/use-auth"
import { AuthHeader, AuthStatus } from "./auth-status"

type FormData = z.infer<typeof resetPasswordFormSchema>

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  userId?: string
  secret?: string
}

export function ResetPasswordForm({
  userId,
  secret,
  className,
  ...props
}: ResetPasswordFormProps) {
  const {
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const resetPasswordMutation = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!userId || !secret) return
    try {
      await resetPasswordMutation.mutateAsync({
        userId,
        secret,
        password: data.password,
      })
    } catch (error) {
      // RECOVERY_LINK_INVALID switches to the "link invalid" view below.
      applyServerError(error, setError, ["password"])
    }
  }

  const isPending = resetPasswordMutation.isPending
  const isLinkInvalid =
    !userId || !secret || resetPasswordMutation.error?.code === "RECOVERY_LINK_INVALID"

  let content: React.ReactNode

  if (isLinkInvalid) {
    content = (
      <FieldGroup>
        <AuthStatus icon={LinkIcon} tone="warning" title="Link invalid or expired">
          <p>
            This password reset link is no longer valid. Links expire after 1 hour and can
            only be used once.
          </p>
        </AuthStatus>
        <Field>
          <Link href="/forgot-password" className={buttonVariants({ variant: "primary" })}>
            Request a new link
          </Link>
        </Field>
        <FieldDescription className="text-center">
          Remembered it? <Link href="/login">Back to login</Link>
        </FieldDescription>
      </FieldGroup>
    )
  } else if (resetPasswordMutation.isSuccess) {
    content = (
      <FieldGroup>
        <AuthStatus icon={ShieldCheckIcon} title="Password updated">
          <p>Your password has been reset. You can now log in with your new password.</p>
        </AuthStatus>
        <Field>
          <Link href="/login" className={buttonVariants({ variant: "primary" })}>
            Continue to login
          </Link>
        </Field>
      </FieldGroup>
    )
  } else {
    content = (
      <Form
        onSubmit={({ data }) => onSubmit(data)}
        control={control}
        method="post"
      >
        <FieldGroup>
          <AuthHeader subtitle="Choose a new password for your account." />

          <FormAlert message={errors.root?.server?.message} />

          <FormInput
            control={control}
            name="password"
            label="New password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            description={`At least ${PASSWORD_MIN} characters.`}
            autoFocus
            labelAction={
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                aria-controls="password confirmPassword"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" aria-hidden="true" />
                ) : (
                  <EyeIcon className="size-4" aria-hidden="true" />
                )}
                {showPassword ? "Hide" : "Show"}
                <span className="sr-only"> passwords</span>
              </button>
            }
          />
          <FormInput
            control={control}
            name="confirmPassword"
            label="Confirm new password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
          />
          <Field>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending && <Spinner aria-hidden="true" />}
              {isPending ? "Updating password…" : "Reset password"}
            </Button>
          </Field>
          <FieldDescription className="text-center">
            Remembered it? <Link href="/login">Back to login</Link>
          </FieldDescription>
        </FieldGroup>
      </Form>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6 justify-center px-4", className)} {...props}>
      <div className="flex justify-center">
        <Card className="overflow-hidden p-0 w-full max-w-100">
          <CardContent>
            <div className="p-6 md:p-8">{content}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
