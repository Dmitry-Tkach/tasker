---
name: tasker-nextjs16
description: Conventions and gotchas for the modified Next.js 16 used in tasker. Use before writing or editing any Next.js-specific code — pages, layouts, route handlers, metadata, fonts, images, server/client components.
---

# Next.js 16 in tasker

Per `AGENTS.md`, this is a **modified Next.js 16** whose APIs/conventions may
differ from training data. **Read the relevant guide in
`node_modules/next/dist/docs/` before writing framework code.** Resolve that
path from the project root (the `next` package dir).

## Where the docs live
```
node_modules/next/dist/docs/
  01-app/
    01-getting-started/        installation, project-structure, layouts-and-pages,
                               server-and-client-components, fetching-data,
                               mutating-data, caching, route-handlers, fonts, images, ...
    02-guides/                 testing, migrating, upgrading, client-side-data-fetching
    03-api-reference/
      01-directives/           use-client, use-server, use-cache, ...
      03-file-conventions/     page, layout, route, middleware, route-groups,
                               dynamic-routes, loading, error, not-found, ...
      04-functions/  05-config/  06-cli/  07-adapters/
```
Map the task → guide before coding. Examples:
- Adding a page/layout → `01-getting-started/03-layouts-and-pages.md`,
  `03-api-reference/03-file-conventions/{page,layout}.md`
- A route handler → `01-getting-started/15-route-handlers.md`,
  `03-file-conventions/route.md`
- Client vs server component → `01-getting-started/05-server-and-client-components.md`,
  `01-directives/use-client.md`

## Project-specific facts observed in this repo
- **Typed route props are global helpers.** Root layout uses
  `RootLayout({ children }: LayoutProps<"/">)` — `LayoutProps<Route>` and
  `PageProps<Route>` are generated globals; don't hand-roll these prop types.
- **Route groups** organize without affecting the URL: `app/(auth)/login/page.tsx`
  serves `/login`. See `03-file-conventions/route-groups.md`.
- **Fonts** via `next/font/google`, wired as CSS variables in `app/layout.tsx`.
- **Client components need `"use client"`.** Any file using hooks
  (`useState`, `useForm`, etc.) must declare it as the first line. (Several
  auth form components currently omit this — add it when touching them.)

## The AGENTS.md agent block
`next dev` writes/re-adds that block (see
`node_modules/next/dist/server/lib/generate-agent-files.js`). If it shows up
as an uncommitted diff, commit it with your work to keep the tree clean;
deleting it just makes `next dev` recreate it.
