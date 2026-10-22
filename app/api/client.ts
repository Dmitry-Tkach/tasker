import { hc } from 'hono/client';
import type { AppType } from '@/app/api/[[...route]]/route';

// Requests go to the current origin (`/api/...`), so the browser calls the
// site it was loaded from and needs no configured URL. The server app uses
// `.basePath('/api')`, so `/api` is already part of the RPC path (client.api.*).
// Browser-only: on the server a relative URL can't be fetched.
export const client = hc<AppType>('/');
