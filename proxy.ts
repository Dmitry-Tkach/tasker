import { NextResponse, type NextRequest } from 'next/server';
import {
  GUEST_ONLY_PATHS,
  PUBLIC_PATHS,
  SESSION_COOKIE,
  loginPath,
} from '@/app/(auth)/_lib/session';

// Optimistic auth redirects: only checks whether a session cookie exists (no
// Appwrite call, since this runs on every navigation and prefetch). Pages
// verify the session for real with requireUser() from the auth DAL.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(loginPath(pathname + search), request.url));
  }

  if (hasSession && GUEST_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except the API (which does its own auth), Next internals and
  // static files from public/.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
