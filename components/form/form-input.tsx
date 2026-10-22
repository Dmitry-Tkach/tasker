"use client"

import { useController, type Control, type FieldValues, type Path } from "react-hook-form"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type FormInputProps<T extends FieldValues> = Omit<
  React.ComponentProps<"input">,
  "id" | "name" | "value" | "defaultValue" | "onChange" | "onBlur"
> & {
  control: Control<T>
  name: Path<T>
  label: React.ReactNode
  /** Hint shown under the input; stays visible (and described) alongside errors. */
  description?: React.ReactNode
  /** Rendered at the end of the label row, e.g. a "Forgot password?" link. */
  labelAction?: React.ReactNode
}

/**
 * Labelled input bound to a react-hook-form field. Wires up `data-invalid`,
 * `aria-invalid` and `aria-describedby` for the hint and the error, and shows
 * client (zod) and server (`setError`) errors the same way.
 */
export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  labelAction,
  ...inputProps
}: FormInputProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name })

  const descriptionId = description ? `${name}-description` : undefined
  const errorId = error ? `${name}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  const labelElement = <FieldLabel htmlFor={name}>{label}</FieldLabel>

  return (
    <Field data-invalid={!!error}>
      {labelAction ? (
        <div className="flex items-center">
          {labelElement}
          <div className="ml-auto">{labelAction}</div>
        </div>
      ) : (
        labelElement
      )}
      <Input
        {...inputProps}
        {...field}
        id={name}
        aria-invalid={!!error}
        aria-describedby={describedBy}
      />
      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {/* Not role="alert": focus moves to the first invalid field on submit and
          the message is read via aria-describedby, so announcing every error
          at once would only be noise. */}
      <FieldError id={errorId} role={undefined} errors={[error]} />
    </Field>
  )
}
