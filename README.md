# Tasker

A task manager built with Next.js 16 (App Router), React 19, a Hono API, and
shadcn UI.

**Live:** https://tasker-production-e8a9.up.railway.app/

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 19
- **API:** [Hono](https://hono.dev) mounted at `/api`, with zod validation and a
  typed RPC client (`app/api/client.ts`)
- **UI:** shadcn (base-ui), Tailwind v4, lucide icons, recharts
- **Data/forms:** TanStack Query, react-hook-form + zod

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable              | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app (used by the Hono RPC client). |

## Scripts

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the dev server (port 3000) |
| `npm run build` | Production build                 |
| `npm run start` | Serve the production build       |
| `npm run lint`  | Lint with ESLint                 |

## Deployment

Deployed on [Railway](https://railway.app) — auto-deploys on push to `main`,
built with Nixpacks.

- Set `NEXT_PUBLIC_APP_URL` in the Railway service variables to the public
  domain. It is inlined at build time, so changing it requires a redeploy.
- CI (lint / typecheck / build on PRs) runs via GitHub Actions.
