"use client"

import { useEffect, useState } from "react"
import * as z from "zod"
import Link from "next/link"
import { Form, useForm, SubmitHandler, ErrorMessage } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, CircleAlertIcon, MailCheckIcon } from "lucide-react"

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
import { useForgotPassword } from "../_hooks/use-auth"
import { AuthHeader, AuthStatus } from "./auth-status"

const RESEND_COOLDOWN_SECONDS = 30

const formSchema = z.object({
  email: z.email("Enter a valid email address"),
})

type FormData = z.infer<typeof formSchema>

/** Counts down from `seconds` to 0 once started. */
function useCooldown() {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (remaining <= 0) return
    const id = setTimeout(() => setRemaining((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining])

  return [remaining, setRemaining] as const
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    control,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const forgotPasswordMutation = useForgotPassword()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const [cooldown, startCooldown] = useCooldown()

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await forgotPasswordMutation.mutateAsync(data)
      setSentTo(data.email)
      setResent(false)
      startCooldown(RESEND_COOLDOWN_SECONDS)
    } catch {
      // Error is rendered from forgotPasswordMutation.error
    }
  }

  const onResend = async () => {
    if (!sentTo) return
    setResent(false)
    try {
      await forgotPasswordMutation.mutateAsync({ email: sentTo })
      setResent(true)
      startCooldown(RESEND_COOLDOWN_SECONDS)
    } catch {
      // Error is rendered from forgotPasswordMutation.error
    }
  }

  const isPending = forgotPasswordMutation.isPending
  const submitError = forgotPasswordMutation.error

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

                  {submitError && (
                    <Alert variant="destructive">
                      <CircleAlertIcon aria-hidden="true" />
                      <AlertDescription>{submitError.message}</AlertDescription>
                    </Alert>
                  )}

                  <Field>
                    <Link href="/login" className={buttonVariants({ variant: "primary" })}>
                      <ArrowLeftIcon aria-hidden="true" />
                      Back to login
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onResend}
                      disabled={isPending || cooldown > 0}
                    >
                      {isPending && <Spinner aria-hidden="true" />}
                      {isPending
                        ? "Sending…"
                        : cooldown > 0
                          ? `Resend email in ${cooldown}s`
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
                  noValidate
                >
                  <FieldGroup>
                    <AuthHeader subtitle="Forgot your password? Enter your email and we'll send you a reset link." />

                    {submitError && (
                      <Alert variant="destructive">
                        <CircleAlertIcon aria-hidden="true" />
                        <AlertDescription>{submitError.message}</AlertDescription>
                      </Alert>
                    )}

                    <Field data-invalid={!!errors.email}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="m@example.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        autoFocus
                      />
                      <ErrorMessage
                        control={control}
                        name="email"
                        render={({ message }) => <FieldError id="email-error">{message}</FieldError>}
                      />
                    </Field>
                    <Field>
                      <Button type="submit" variant="primary" disabled={isPending}>
                        {isPending && <Spinner aria-hidden="true" />}
                        {isPending ? "Sending link…" : "Send reset link"}
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
