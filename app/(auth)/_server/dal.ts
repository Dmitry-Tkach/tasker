import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppwriteException } from 'node-appwrite';
import { createSessionClient } from './appwrite';
import { SESSION_COOKIE } from '../_lib/session';

// Data access layer for the signed-in user. proxy.ts only checks that a
// session cookie exists; these functions verify it with Appwrite. Call them
// from Server Components/route code that needs the user — not in layouts as
// the only guard, since layouts don't re-render on navigation.

/** The fields of the user that are safe to pass to Client Components. */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * The signed-in user, or null if there's no valid session. Memoized per
 * request. Appwrite outages throw (shown by app/error.tsx) rather than
 * logging the user out.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) return null;

  try {
    const user = await createSessionClient(session).account.get();
    return { id: user.$id, name: user.name, email: user.email };
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 401) return null;
    throw e;
  }
});

/**
 * The signed-in user, or a redirect to /login. `path` is the current page, so
 * the user comes back to it after signing in. An invalid/expired cookie is
 * cleared on the way (Server Components can't delete cookies themselves, and
 * leaving it would make proxy.ts bounce /login back here).
 */
export async function requireUser(path = '/'): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(`/api/auth/expired?next=${encodeURIComponent(path)}`);
  return user;
}
