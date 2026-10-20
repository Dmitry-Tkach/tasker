import { hc } from 'hono/client';
import type { AppType } from '@/app/api/[[...route]]/route';

// The server app uses `.basePath('/api')`, so the `/api` segment is part of the
// RPC path (client.api.*). The base URL must therefore be the origin only —
// otherwise requests would hit `/api/api/...`.
export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL ?? '');
