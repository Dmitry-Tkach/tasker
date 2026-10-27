"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Form, useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { formatCooldown, rateLimitWait, useCooldown } from "@/app/(auth)/_hooks/use-cooldown"
import { workspacePath } from "@/app/(app)/_lib/nav"
import { FormAlert } from "@/components/form/form-alert"
import { FormInput } from "@/components/form/form-input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { applyServerError } from "@/lib/form-errors"
import { WORKSPACE_IMAGE_MAX_BYTES } from "../_server/appwrite-ids"
import { WORKSPACE_IMAGE_ACCEPT, createWorkspaceSchema, type CreateWorkspaceInput } from "../_lib/schemas"
import { useCreateWorkspace } from "../_hooks/use-workspaces"
import { ImagePicker } from "./image-picker"

/**
 * Names a new workspace and optionally gives it an image. `isFirst` is the
 * onboarding step after sign-up; otherwise the user can go back.
 */
export function CreateWorkspaceForm({ isFirst }: { isFirst: boolean }) {
  const router = useRouter()
  const {
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", image: undefined },
  })

  const createMutation = useCreateWorkspace()
  const [cooldown, startCooldown] = useCooldown()

  const onSubmit: SubmitHandler<CreateWorkspaceInput> = async (data) => {
    try {
      const { workspace } = await createMutation.mutateAsync(data)
      router.replace(workspacePath(workspace.slug))
      router.refresh()
    } catch (error) {
      const apiError = applyServerError(error, setError, ["name", "image"])
      if (apiError.code === "RATE_LIMITED") startCooldown(rateLimitWait(apiError))
    }
  }

  const isPending = createMutation.isPending

  return (
    <Card className="w-full max-w-md">
      <CardContent>
        <Form onSubmit={({ data }) => onSubmit(data)} control={control} method="post" encType="multipart/form-data">
          <FieldGroup>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {isFirst ? "Create your workspace" : "Create a workspace"}
              </h1>
              <p className="text-balance text-muted-foreground">
                A workspace holds your team&apos;s tasks. You can invite people once it&apos;s set up.
              </p>
            </div>
            <FormAlert message={errors.root?.server?.message} />
            <FormInput
              control={control}
              name="name"
              label="Workspace name"
              type="text"
              autoComplete="organization"
              placeholder="Acme Inc."
              autoFocus
            />
            <ImagePicker
              control={control}
              name="image"
              label="Workspace image"
              accept={WORKSPACE_IMAGE_ACCEPT}
              description={`Optional. PNG, JPEG or WebP, up to ${WORKSPACE_IMAGE_MAX_BYTES / (1024 * 1024)} MB.`}
            />
            <Field>
              <Button type="submit" variant="primary" disabled={isPending || cooldown > 0}>
                {isPending && <Spinner aria-hidden="true" />}
                {isPending
                  ? "Creating workspace…"
                  : cooldown > 0
                    ? `Try again in ${formatCooldown(cooldown)}`
                    : "Create workspace"}
              </Button>
              {isFirst ? null : (
                <Link href="/" className={buttonVariants({ variant: "ghost" })}>
                  Cancel
                </Link>
              )}
            </Field>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  )
}
