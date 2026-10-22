import { Hono } from 'hono';
import { AppwriteException, ID } from 'node-appwrite';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { createAdminClient, createSessionClient } from './appwrite';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../_lib/schemas';
import { UNAUTHORIZED, fromAppwrite, validate } from '@/app/api/_lib/errors';
import { getClientIp, limiters } from '@/app/api/_lib/rate-limit';

export const SESSION_COOKIE = 'tasker-session';

// Options for the HTTP-only session cookie holding the Appwrite session secret.
const sessionCookieOptions = (expire: string) =>
  ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    expires: new Date(expire),
  }) as const;

const auth = new Hono()
  // Rate limiters run before validation so malformed requests count too.
  .post('/register', limiters.register.byIp(), validate('json', registerSchema), async (c) => {
    const { name, email, password } = c.req.valid('json');
    const { account } = createAdminClient();

    let user;
    try {
      user = await account.create({ userId: ID.unique(), email, password, name });
    } catch (e) {
      throw fromAppwrite(e, 'register');
    }

    // The account exists at this point. If signing in fails, still report
    // success so a retry doesn't hit "email already exists"; the client sends
    // the user to the login page instead.
    try {
      const session = await account.createEmailPasswordSession({ email, password });
      setCookie(c, SESSION_COOKIE, session.secret, sessionCookieOptions(session.expire));
      return c.json({ user, signedIn: true }, 201);
    } catch (e) {
      console.error('[register] account created but sign-in failed', e);
      return c.json({ user, signedIn: false }, 201);
    }
  })
  .post('/login', limiters.login.byIp(), validate('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    limiters.loginAccount.check(`${getClientIp(c)}:${email.toLowerCase()}`);
    const { account } = createAdminClient();

    try {
      const session = await account.createEmailPasswordSession({ email, password });
      setCookie(c, SESSION_COOKIE, session.secret, sessionCookieOptions(session.expire));

      const user = await createSessionClient(session.secret).account.get();
      return c.json({ user });
    } catch (e) {
      throw fromAppwrite(e, 'login');
    }
  })
  .get('/me', async (c) => {
    const session = getCookie(c, SESSION_COOKIE);
    if (!session) throw UNAUTHORIZED;

    try {
      const user = await createSessionClient(session).account.get();
      return c.json({ user });
    } catch (e) {
      throw fromAppwrite(e, 'session');
    }
  })
  .post('/logout', async (c) => {
    const session = getCookie(c, SESSION_COOKIE);
    if (session) {
      try {
        await createSessionClient(session).account.deleteSession({ sessionId: 'current' });
      } catch {
        // Session may already be invalid; clear the cookie regardless.
      }
    }
    deleteCookie(c, SESSION_COOKIE, { path: '/' });
    return c.json({ success: true });
  })
  .post('/recovery', limiters.recoveryRequest.byIp(), validate('json', forgotPasswordSchema), async (c) => {
    const { email } = c.req.valid('json');
    limiters.recoveryEmail.check(email.toLowerCase());
    const { account } = createAdminClient();
    // Appwrite emails a link to /reset-password?userId=...&secret=... The
    // host must be registered as a Web platform in the Appwrite project.
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(c.req.url).origin;

    try {
      await account.createRecovery({ email, url: `${origin}/reset-password` });
    } catch (e) {
      // Answer an unknown email exactly like a known one, so this endpoint
      // can't be used to find out which emails have accounts.
      const unknownEmail = e instanceof AppwriteException && e.code === 404;
      if (!unknownEmail) throw fromAppwrite(e, 'recovery-request');
    }
    return c.json({ success: true });
  })
  .put('/recovery', limiters.recoveryConfirm.byIp(), validate('json', resetPasswordSchema), async (c) => {
    const { userId, secret, password } = c.req.valid('json');
    const { account } = createAdminClient();

    try {
      await account.updateRecovery({ userId, secret, password });
    } catch (e) {
      throw fromAppwrite(e, 'recovery');
    }
    return c.json({ success: true });
  });

export default auth;
