---
name: tasker-ui
description: UI and form conventions for tasker — shadcn (base-ui) components, Tailwind v4, lucide icons, and react-hook-form + zod forms. Use when building or editing pages, components, or forms.
---

# UI conventions

Stack: **shadcn** (style `base-vega`, built on `@base-ui/react`), **Tailwind v4**,
**lucide-react** icons, **recharts** for charts, **embla** for carousels.
Config in `components.json`.

## Components & imports
- Primitives live in `components/ui/*` (Button, Card, Input, Field, Dialog, …).
  Import via aliases: `@/components/ui/<name>`.
- Add new shadcn primitives with the shadcn CLI rather than hand-writing them,
  so they match the `base-vega` style and registry.
- Icons from `lucide-react`.
- **`cn` is imported from the `"cn"` package**, re-exported by `@/lib/utils`.
  Use `import { cn } from "@/lib/utils"` in components (both forms currently
  import directly from `"cn"` — either works, but `@/lib/utils` is the alias).

## Forms (react-hook-form + zod)
Established pattern (see `app/(auth)/components/*-form.tsx`):
- Use a shared zod schema (auth: `app/(auth)/_lib/schemas.ts`, also used by
  the API) and derive the type with `z.infer`.
- `useForm({ resolver: zodResolver(schema), defaultValues })`, rendered with
  react-hook-form's `<Form onSubmit={({ data }) => onSubmit(data)} control={control}>`.
- Layout with `FieldGroup` / `Field` / `FieldDescription` /
  `FieldSeparator` from `@/components/ui/field`.
- **Inputs: use `FormInput`** from `@/components/form/form-input`
  (`control`, `name`, `label`, optional `description` hint and `labelAction`,
  plus any input props). It wires `data-invalid`, `aria-invalid`,
  `aria-describedby` (hint + error) and shows client and server errors the
  same way. Don't hand-roll `ErrorMessage` + `<p>`.

### Errors pattern
- Submit handler: `try { await mutation.mutateAsync(data); … } catch (error)
  { applyServerError(error, setError, ["field", …]) }` (`@/lib/form-errors`).
  It sends server `fields` to those inputs (focusing the first) and everything
  else to `errors.root.server`. Always catch: an uncaught rejection from
  `mutateAsync` surfaces as an unhandled error.
- Render `<FormAlert message={errors.root?.server?.message} />`
  (`@/components/form/form-alert`) under the form header.
- Login-style forms: credential errors stay form-level, never on a field.
- Disable the submit button with a `Spinner` while `mutation.isPending`.
- On `RATE_LIMITED`, start `useCooldown()` from `app/(auth)/_hooks/use-cooldown`
  with `RATE_LIMIT_COOLDOWN_SECONDS` and show "Try again in Ns".
- Toasts are not for form errors.

### Route-level errors
`app/error.tsx`, `app/global-error.tsx` and `app/not-found.tsx` use
`StatusPage` (`@/components/status-page`). Error boundaries get `retry`
(not `reset`) in this Next version; never render `error.message`.

## Layout / styling
- Global styles + theme tokens in `app/globals.css` (Tailwind v4,
  CSS-variable theming, `baseColor: neutral`).
- Fonts (Geist, Geist Mono, Inter) are set as CSS vars in `app/layout.tsx`;
  use `font-sans` etc. rather than re-importing fonts.
- Providers: `QueryProvider` wraps the app in `app/layout.tsx`.
