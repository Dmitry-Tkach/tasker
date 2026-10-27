"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useController, type Control, type FieldValues, type Path } from "react-hook-form"
import { ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"

type ImagePickerProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: React.ReactNode
  description?: React.ReactNode
  /** `accept` for the file input, e.g. "image/png,image/jpeg". */
  accept: string
}

/**
 * Optional image bound to a react-hook-form field holding a `File`. Shows a
 * square preview with "Upload"/"Change" and "Remove" buttons; validation (type,
 * size) is left to the form's schema.
 */
export function ImagePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  accept,
}: ImagePickerProps<T>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ control, name })
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const file: File | undefined = (value as unknown) instanceof File ? (value as File) : undefined

  // Object URL for the preview, made when a file is picked. It's only shown
  // while that file is still the field's value (e.g. not after a reset).
  const [preview, setPreview] = useState<{ file: File; url: string }>()
  const previewUrl = file && preview?.file === file ? preview.url : undefined
  useEffect(() => (preview ? () => URL.revokeObjectURL(preview.url) : undefined), [preview])

  const select = (next: File | undefined) => {
    setPreview(next ? { file: next, url: URL.createObjectURL(next) } : undefined)
    onChange(next)
  }

  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground">
          {previewUrl ? (
            // A local blob URL: next/image can't optimise it.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Selected image preview" className="size-full object-cover" />
          ) : (
            <ImageIcon aria-hidden="true" className="size-6" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            ref={ref}
            type="button"
            variant="outline"
            size="sm"
            aria-describedby={describedBy}
            aria-invalid={!!error}
            onClick={() => inputRef.current?.click()}
          >
            {file ? "Change image" : "Upload image"}
          </Button>
          {file ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                select(undefined)
                if (inputRef.current) inputRef.current.value = ""
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          tabIndex={-1}
          onBlur={onBlur}
          onChange={(event) => select(event.target.files?.[0] ?? undefined)}
        />
      </div>
      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      <FieldError id={errorId} role={undefined} errors={[error]} />
    </Field>
  )
}
