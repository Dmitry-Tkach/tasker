"use client"

import { useState } from "react"
import Link from "next/link"
import { Form, useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type * as z from "zod"
import { ArrowLeftIcon, MailCheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api-error"
import { applyServerError } from "@/lib/form-errors"
import { FormAlert } from "@/components/form/form-alert"
import { FormInput } from "@/components/form/form-input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { forgotPasswordSchema } from "../_lib/schemas"
import { useForgotPassword } from "../_hooks/use-auth"
import { formatCooldown, rateLimitWait, useCooldown } from "../_hooks/use-cooldown"
import { AuthHeader, AuthStatus } from "./auth-status"

const RESEND_COOLDOWN_SECONDS = 30

type FormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const forgotPasswordMutation = useForgotPassword()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const [resendCooldown, startResendCooldown] = useCooldown()
  const [rateLimitCooldown, startRateLimitCooldown] = useCooldown()

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await forgotPasswordMutation.mutateAsync(data)
      setSentTo(data.email)
      setResent(false)
      startResendCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (error) {
      const apiError = applyServerError(error, setError, ["email"])
      if (apiError.code === "RATE_LIMITED") startRateLimitCooldown(rateLimitWait(apiError))
    }
  }

  const onResend = async () => {
    if (!sentTo) return
    setResent(false)
    try {
      await forgotPasswordMutation.mutateAsync({ email: sentTo })
      setResent(true)
      startResendCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (error) {
      // The message is rendered from forgotPasswordMutation.error below.
      if (error instanceof ApiError && error.code === "RATE_LIMITED") {
        startResendCooldown(rateLimitWait(error))
      }
    }
  }

  const isPending = forgotPasswordMutation.isPending

  return (
    <div className={cn("flex flex-col gap-6 justify-center px-4", className)} {...props}>
      <div className="flex justify-center">
        <Card className="overflow-hidden p-0 w-full max-w-100">
          <CardContent>
            <div className="p-6 md:p-8">
              {sentTo ? (
                <FieldGroup>
                  <AuthStatus icon={MailCheckIcon} title="Check your inbox">
                    <p>
                      If an account exists for{" "}
                      <span className="font-medium text-foreground break-all">{sentTo}</span>,
                      you&apos;ll get an email with a link to reset your password.
                    </p>
                    <p className="text-sm">The link expires in 1 hour. Check your spam folder if it doesn&apos;t arrive.</p>
                  </AuthStatus>

                  <div aria-live="polite" className="empty:hidden">
                    {resent && !isPending && (
                      <p className="text-center text-sm text-muted-foreground">
                        We sent another email to {sentTo}.
                      </p>
                    )}
                  </div>

                  <FormAlert message={forgotPasswordMutation.error?.message} />

                  <Field>
                    <Link href="/login" className={buttonVariants({ variant: "primary" })}>
                      <ArrowLeftIcon aria-hidden="true" />
                      Back to login
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onResend}
                      disabled={isPending || resendCooldown > 0}
                    >
                      {isPending && <Spinner aria-hidden="true" />}
                      {isPending
                        ? "Sending…"
                        : resendCooldown > 0
                          ? `Resend email in ${formatCooldown(resendCooldown)}`
                          : "Resend email"}
                    </Button>
                  </Field>

                  <FieldDescription className="text-center">
                    Wrong address?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:text-primary"
                      onClick={() => {
                        forgotPasswordMutation.reset()
                        startResendCooldown(0)
                        setSentTo(null)
                      }}
                    >
                      Use a different email
                    </button>
                  </FieldDescription>
                </FieldGroup>
              ) : (
                <Form
                  onSubmit={({ data }) => onSubmit(data)}
                  control={control}
                  method="post"
                >
                  <FieldGroup>
                    <AuthHeader subtitle="Forgot your password? Enter your email and we'll send you a reset link." />

                    <FormAlert message={errors.root?.server?.message} />

                    <FormInput
                      control={control}
                      name="email"
                      label="Email"
                      type="email"
                      autoComplete="email"
                      placeholder="m@example.com"
                      autoFocus
                    />
                    <Field>
                      <Button type="submit" variant="primary" disabled={isPending || rateLimitCooldown > 0}>
                        {isPending && <Spinner aria-hidden="true" />}
                        {isPending
                          ? "Sending link…"
                          : rateLimitCooldown > 0
                            ? `Try again in ${formatCooldown(rateLimitCooldown)}`
                            : "Send reset link"}
                      </Button>
                    </Field>
                    <FieldDescription className="text-center">
                      Remembered it? <Link href="/login">Back to login</Link>
                    </FieldDescription>
                  </FieldGroup>
                </Form>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
