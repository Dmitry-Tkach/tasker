---
name: tasker-railway
description: How tasker deploys on Railway (CD) and the division of labor between repo config and the Railway dashboard. Use when setting up deployment, adding railway/Nixpacks config, debugging a Railway build, or wiring env vars for the deployed app.
---

# Deploying tasker on Railway

Decided approach: **Railway for CD** (auto-deploy on push, **Nixpacks** build)
+ **GitHub Actions for CI** (lint/typecheck/`next build` on PRs). Railway builds
and ships; it does NOT gate merges on tests — that's CI's job.

## Division of labor (important)
- **I (Claude) can't log into Railway.** I handle everything in the repo:
  `railway.json`/`nixpacks.toml` if needed, the GitHub Actions workflow, env
  documentation, and the Next.js config.
- **The user handles the Railway dashboard:** create/connect the project to the
  GitHub repo, set environment variables, provision Postgres/Redis, and map the
  domain. For anything that needs `railway login` (interactive), the user runs
  it — suggest typing `! railway login` in the session so output lands here.

## Build: Nixpacks (default)
- Railway auto-detects Next.js 16 and runs `npm install` → `npm run build`,
  then `npm run start`. No build config needed to start.
- `next start` must bind Railway's injected `$PORT`. Next respects `PORT`, so
  `next start` works as-is; if a custom start is ever needed:
  `next start -p $PORT`.
- Only add `railway.json` / `nixpacks.toml` if we outgrow the defaults
  (custom start command, build caching, Node version pin). Prefer zero-config
  until something forces otherwise.

## Environment variables (set in Railway dashboard, NOT committed)
- **`NEXT_PUBLIC_APP_URL`** — the deployed public URL (e.g.
  `https://tasker-production.up.railway.app` or the custom domain), **not**
  localhost. The RPC client in `app/api/client.ts` reads this at build/runtime;
  if unset, the client base URL is `undefined`. (Note `NEXT_PUBLIC_` vars are
  inlined at build time, so a change requires a rebuild/redeploy.)
- **Database** — when we add Postgres, Railway injects `DATABASE_URL`; reference
  Railway's variable so it stays in sync.
- `.env*` is gitignored — never commit secrets. Keep a committed
  `.env.example` with var names only as the source of truth.

## Railway CLI (optional, local)
Not installed yet. Install with `npm i -g @railway/cli` (or `brew install railway`).
Common flow once the project exists:
- `railway login` (interactive — user runs it)
- `railway link` to connect this repo dir to the Railway project
- `railway variables` to inspect env, `railway up` for a manual deploy,
  `railway logs` to debug. Verify exact subcommands with `railway --help`,
  since the CLI changes.

## CI side (GitHub Actions)
Lives in `.github/workflows/`. Runs on PRs: `npm ci`, `npm run lint`,
`tsc --noEmit` (typecheck), `npm run build`. Keep CI's Node version aligned
with whatever Railway/Nixpacks uses so "passes CI" means "builds on Railway".

See [[cicd-approach]] in memory for the standing decision and rationale.
