---
name: tasker-run-verify
description: How to launch, build, lint and verify the tasker app locally. Use whenever you need to run the dev server, reproduce behavior in the browser, or confirm a change works (pairs with /run and /verify).
---

# Running & verifying tasker

Next.js 16 (App Router) + React 19. Package manager: npm (see `package-lock.json`).

## Commands

| Task | Command | Notes |
|------|---------|-------|
| Dev server | `npm run dev` | `next dev`, serves on **http://localhost:3000** by default |
| Production build | `npm run build` | Use to catch type/route errors before shipping |
| Start built app | `npm run start` | Requires a prior `npm run build` |
| Lint | `npm run lint` | `eslint` (flat config, `eslint-config-next`) |

There is no test runner wired up yet — "verify" means running the app and
observing behavior. Prefer the `/run` skill to launch and the `/verify` skill
to confirm a change end-to-end.

## Routes to hit
- `/login`, `/register` — auth pages (route group `app/(auth)/`)
- `/api/auth/login` — Hono API (POST only right now)

## Environment — READ THIS, it's a common trap
- Next.js loads env from **`.env.local` at the project root**, not `app/.env.local`.
  A file under `app/` will NOT be picked up.
- Browser-exposed vars must be prefixed **`NEXT_PUBLIC_`**. The RPC client
  (`app/api/client.ts`) reads `process.env.NEXT_PUBLIC_APP_URL`, so the env
  must define `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`).
- If the API client base URL comes out `undefined`, this mismatch is almost
  always why.

## After pulling / installing
- `npm install` if `package.json` or the lockfile changed.
- `next dev` regenerates the agent block in `AGENTS.md` and may touch
  `node_modules/next/dist/server/lib/generate-agent-files.js` — expected.
