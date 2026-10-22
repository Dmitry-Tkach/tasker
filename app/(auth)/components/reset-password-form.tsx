"use client"

import { useState } from "react"
import * as z from "zod"
import Link from "next/link"
import { Form, useForm, SubmitHandler, ErrorMessage } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  LinkIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { RecoveryLinkError, useResetPassword } from "../_hooks/use-auth"
import { AuthHeader, AuthStatus } from "./auth-status"

// Same rule as register-form (Appwrite also requires 8+ characters).
const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

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
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
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
    } catch {
      // Error is rendered from resetPasswordMutation.error
    }
  }

  const isPending = resetPasswordMutation.isPending
  const submitError = resetPasswordMutation.error
  const isLinkInvalid = !userId || !secret || submitError instanceof RecoveryLinkError

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
        noValidate
      >
        <FieldGroup>
          <AuthHeader subtitle="Choose a new password for your account." />

          {submitError && (
            <Alert variant="destructive">
              <CircleAlertIcon aria-hidden="true" />
              <AlertDescription>{submitError.message}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={!!errors.password}>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <button
                type="button"
                className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                aria-controls="password confirmPassword"
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
            </div>
            <Input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : "password-hint"}
              autoFocus
            />
            {errors.password ? (
              <ErrorMessage
                control={control}
                name="password"
                render={({ message }) => <FieldError id="password-error">{message}</FieldError>}
              />
            ) : (
              <FieldDescription id="password-hint">At least 8 characters.</FieldDescription>
            )}
          </Field>
          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
            <Input
              {...register("confirmPassword")}
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            <ErrorMessage
              control={control}
              name="confirmPassword"
              render={({ message }) => <FieldError id="confirmPassword-error">{message}</FieldError>}
            />
          </Field>
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
