---
name: tasker-api
description: How to add and wire backend endpoints in tasker using Hono + zod + the typed RPC client. Use when creating or modifying API routes, request validation, or the client.ts RPC types.
---

# API conventions (Hono + zod RPC)

The backend is a single Hono app mounted into Next's catch-all route handler
and consumed on the client via Hono's typed RPC client (`hc`).

## File layout
- **Root handler:** `app/api/[[...route]]/route.ts` — creates
  `new Hono().basePath('/api')`, mounts feature routers, exports the Next
  HTTP method handlers and the `AppType`.
- **Feature routers:** `app/(feature)/_server/route.ts` — one `new Hono()` per
  feature, exported `default`. Current: `app/(auth)/_server/route.ts`.
  ⚠️ The folder MUST be a private folder (`_server`, underscore-prefixed) so
  Next.js doesn't treat `route.ts` as a Route Handler and fail type-checking
  (`TS2559`). Don't name it plain `server/`.
- **RPC client:** `app/api/client.ts` — `hc<AppType>(baseUrl)`.

## Add a new endpoint — recipe

1. **Define/extend the feature router** (e.g. `app/(tasks)/_server/route.ts`):
   ```ts
   import { Hono } from 'hono';
   import { zValidator } from '@hono/zod-validator';
   import { z } from 'zod';

   const tasks = new Hono()
     .get('/', (c) => c.json({ tasks: [] }))
     .post('/', zValidator('json', z.object({ title: z.string().min(1) })), (c) => {
       const data = c.req.valid('json');   // validated + typed
       return c.json({ data }, 201);
     });

   export default tasks;
   ```
   Chain handlers off `new Hono()` (don't reassign) so RPC types infer cleanly.

2. **Mount it** in `app/api/[[...route]]/route.ts`:
   ```ts
   import tasks from '@/app/(tasks)/_server/route';
   const routes = app.route('/auth', auth).route('/tasks', tasks);
   ```
   Keep assigning the chained result to `routes` — `AppType = typeof routes`
   is what gives the client end-to-end types.

3. **Export every HTTP method the API serves.** `handle(app)` must be exported
   per method:
   ```ts
   export const GET = handle(app);
   export const POST = handle(app);
   // add PUT / PATCH / DELETE as needed
   ```
   ⚠️ Current `route.ts` exports **only `POST`** — any GET/DELETE/etc. will
   404 until its handler is exported. Add the method export when you add the route.

## Calling the API from the client
Prefer the typed client over raw `fetch`:
```ts
import { client } from '@/app/api/client';
const res = await client.api.auth.login.$post({ json: { email, password } });
const data = await res.json();   // typed from the server schema
```
- `client` base URL = `process.env.NEXT_PUBLIC_APP_URL` + `/api`. That var must
  exist in root `.env.local` with the `NEXT_PUBLIC_` prefix (see
  `tasker-run-verify`), or the base URL is `undefined`.
- Wrap mutations in a TanStack Query `useMutation` and reads in `useQuery`
  (provider already set up in `components/QueryProvider.tsx`).

## Validation
- Validate input with `zValidator('<target>', schema)` where target is
  `'json' | 'query' | 'param' | 'form' | 'header'`, then read it back with
  `c.req.valid('<target>')`.
- Reuse the same zod schema shape on the form (react-hook-form) and the server
  so client and server validation stay in sync.
