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
- Define a zod schema, derive the type with `z.infer`.
- `useForm({ resolver: zodResolver(schema), defaultValues })`.
- Build fields with the `Field` family: `FieldGroup`, `Field`, `FieldLabel`,
  `FieldDescription`, `FieldSeparator` from `@/components/ui/field`, with
  `Input` from `@/components/ui/input`.
- Register inputs via `{...register("name")}` and show errors with
  `<ErrorMessage control={control} name="..." render={({message}) => <p>{message}</p>} />`.

### ⚠️ Gotchas in the current auth forms (fix when you touch them)
- **Missing `"use client"`.** These components use `useForm` (a hook) but have
  no `"use client"` directive — required for client components in Next 16.
  Add it as the first line.
- **Submit path.** `login-form.tsx` calls `fetch('/api/auth/login')` directly;
  prefer the typed Hono client + TanStack Query `useMutation` (see `tasker-api`).
- **`register-form.tsx`** has a stray `action="/api/test"`, a submit button
  labeled "Login", and an `ErrorMessage` for `password` placed outside its
  `Field`. Clean these up when working in that file.
- Both form components are named `AuthForm` (one per file) — fine, but rename
  if you ever colocate them.

## Layout / styling
- Global styles + theme tokens in `app/globals.css` (Tailwind v4,
  CSS-variable theming, `baseColor: neutral`).
- Fonts (Geist, Geist Mono, Inter) are set as CSS vars in `app/layout.tsx`;
  use `font-sans` etc. rather than re-importing fonts.
- Providers: `QueryProvider` wraps the app in `app/layout.tsx`.
