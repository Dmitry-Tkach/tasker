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
   export const PUT = handle(app);
   // add PATCH / DELETE as needed
   ```
   ⚠️ Current `route.ts` exports `GET`, `POST` and `PUT` — PATCH/DELETE will
   404 until their handler is exported. Add the method export when you add the route.

## Calling the API from the client
Prefer the typed client over raw `fetch`:
```ts
import { client } from '@/app/api/client';
import { unwrap } from '@/lib/api-error';
const data = await unwrap<LoginResponse>(client.api.auth.login.$post({ json }));
```
`unwrap` returns the JSON body on 2xx and throws `ApiError` otherwise (see
"Errors" below). Type success bodies with a status filter, e.g.
`InferResponseType<typeof login, 200>`.
- `client` calls the current origin (`hc<AppType>('/')` → `/api/...`), so it
  needs no env var but only works in the browser (client components/hooks).
- Wrap mutations in a TanStack Query `useMutation` and reads in `useQuery`
  (provider already set up in `components/QueryProvider.tsx`).

## Validation
- Validate input with `validate('<target>', schema)` from
  `@/app/api/_lib/errors` (a `zValidator` wrapper), where target is
  `'json' | 'query' | 'param' | 'form' | 'header'`, then read it back with
  `c.req.valid('<target>')`. Don't use bare `zValidator`: its 400 body doesn't
  follow the error contract.
- Share one zod schema between the form and the route, in a zod-only file the
  client can import (auth: `app/(auth)/_lib/schemas.ts`). Put user-facing
  messages in the schema; they come back as `fields` on a `VALIDATION` error.

## Errors
Contract (`lib/api-error.ts`, shared by server and client): every non-2xx
response is `{ error: { code, message, fields? } }`. `message` is always safe
to show; `fields` maps input names to messages.

Server (`app/api/_lib/errors.ts`, wired in the root `route.ts` via
`app.onError` / `app.notFound`):
- In a route, **throw** rather than returning error JSON:
  `throw new ApiHttpError(status, { code, message, fields? })`, or a preset
  (`UNAUTHORIZED`, `INVALID_CREDENTIALS`, `RECOVERY_LINK_INVALID`).
- Wrap Appwrite calls: `catch (e) { throw fromAppwrite(e, '<context>') }`. It
  logs Appwrite's message and maps the code to a safe error (429 → RATE_LIMITED,
  5xx/network → UPSTREAM, plus per-context cases). **Never return
  `e.message`** to the client.
- Anything else thrown becomes a logged, generic 500 `INTERNAL`.
- Thrown errors don't appear in the RPC types; only success responses do.
  Keep error responses out of `c.json(...)` returns with non-literal statuses,
  or they widen the success types.
- Don't reveal whether an account exists: login uses one message for all
  credential failures; recovery returns 200 for unknown emails.

Client: hooks use `unwrap`, so `mutation.error` is an `ApiError`
(`status`, `code`, `message`, `fields`; `status` 0 + `NETWORK` for offline).
`QueryProvider` doesn't retry 4xx queries or any mutation. For forms, see the
error pattern in `tasker-ui`.

## Rate limiting
`app/api/_lib/rate-limit.ts` holds an in-memory fixed-window limiter and the
configured `limiters`. Over the limit it throws a 429 `RATE_LIMITED`
`ApiHttpError` with `retryAfter` (seconds); `onError` also sets the
`Retry-After` header, and the forms count down from `retryAfter`.
- Every `/api` request: `limiters.api.byIp()` in the root `route.ts`.
- Per endpoint, put `limiters.<name>.byIp()` **before** `validate(...)` so
  malformed requests count too.
- Per account: call `limiters.<name>.check(key)` inside the handler after
  validation, e.g. login uses `${ip}:${email}`. Don't key lockouts by email
  alone, or anyone can lock a real user out.
- Client IP comes from `getClientIp(c)`: Railway's `X-Real-IP` header.
  Don't key on `X-Forwarded-For` — on Railway it carries client-supplied
  values, so it can be spoofed to dodge the limits (verified in production).
- Counters live in process memory: they reset on restart/deploy and aren't
  shared between instances. Move the store to Redis before running more than
  one Railway replica.
- Appwrite can also return 429; `fromAppwrite` maps it to the same error.

## Auth & protected pages
- **Public pages** are listed in `PUBLIC_PATHS` (`app/(auth)/_lib/session.ts`);
  every other page requires a session. Signed-in users are sent home from
  `GUEST_ONLY_PATHS` (login/register/forgot-password).
- **`proxy.ts`** (Next 16's renamed middleware) does optimistic redirects from
  the cookie's presence only — no Appwrite calls there.
- **Real check:** call `requireUser('<this path>')` from
  `app/(auth)/_server/dal.ts` in every protected page (or wherever user data
  is loaded). Use `getUser()` (memoized per request) just to read the user.
  Don't rely on a layout alone: layouts don't re-render on navigation.
- An invalid cookie makes `requireUser` redirect through
  `GET /api/auth/expired`, which clears it and goes to `/login?next=…`
  (otherwise proxy and page would bounce between `/` and `/login`).
- Protected pages live in the `app/(app)/` route group, whose layout shows the
  user + logout. Redirect targets from `?next=` must go through
  `safeRedirectPath` (blocks off-site redirects).
- API routes don't go through the proxy; check the session cookie in the
  route itself (see `/me`).
