import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { SESSION_COOKIE } from '@/app/(auth)/_lib/session';
import { findWorkspaceBySlug, listWorkspaces } from './workspaces';

// Workspace reads for Server Components. Call requireUser() first: these
// assume a valid session and only scope what it can see.

async function session() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) throw new Error('getWorkspaces/requireWorkspace called without a session; call requireUser() first.');
  return value;
}

/** The signed-in user's workspaces, oldest first. Memoized per request. */
export const getWorkspaces = cache(async () => listWorkspaces(await session()));

/**
 * The workspace at /w/[slug], or the 404 page if it doesn't exist or the
 * user isn't a member (the two aren't told apart). Memoized per request.
 */
export const requireWorkspace = cache(async (slug: string) => {
  const workspace = await findWorkspaceBySlug(await session(), slug);
  if (!workspace) notFound();
  return workspace;
});
