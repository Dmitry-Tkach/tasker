// Session constants and helpers shared by the API, the proxy and pages.
// Must stay free of server-only imports: proxy.ts and client pages use it.

/** HTTP-only cookie holding the Appwrite session secret. */
export const SESSION_COOKIE = 'tasker-session';

/** Pages anyone can open, signed in or not. */
export const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

/** Pages only for signed-out users; signed-in users are sent home. */
export const GUEST_ONLY_PATHS = ['/login', '/register', '/forgot-password'];

/**
 * Returns `value` if it's a same-site path (e.g. "/tasks?id=1"), otherwise
 * `fallback`. Use it on any user-supplied redirect target such as `?next=`,
 * so it can't send people to another site ("//evil.com", "https://…").
 */
export function safeRedirectPath(value: unknown, fallback = '/'): string {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}

/** /login, carrying where to go after signing in (omitted for the home page). */
export function loginPath(next?: string): string {
  const target = safeRedirectPath(next);
  return target === '/' ? '/login' : `/login?next=${encodeURIComponent(target)}`;
}
