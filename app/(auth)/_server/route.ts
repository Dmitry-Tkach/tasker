import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ID } from 'node-appwrite';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { createAdminClient, createSessionClient } from './appwrite';
import { loginSchema, registerSchema } from '../_lib/schemas';

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
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const { name, email, password } = c.req.valid('json');
    const { account } = createAdminClient();

    try {
      await account.create({ userId: ID.unique(), email, password, name });
      const session = await account.createEmailPasswordSession({ email, password });
      setCookie(c, SESSION_COOKIE, session.secret, sessionCookieOptions(session.expire));

      const user = await createSessionClient(session.secret).account.get();
      return c.json({ user }, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Registration failed' }, 400);
    }
  })
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { email, password } = c.req.valid('json');
    const { account } = createAdminClient();

    try {
      const session = await account.createEmailPasswordSession({ email, password });
      setCookie(c, SESSION_COOKIE, session.secret, sessionCookieOptions(session.expire));

      const user = await createSessionClient(session.secret).account.get();
      return c.json({ user });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Invalid credentials' }, 401);
    }
  })
  .get('/me', async (c) => {
    const session = getCookie(c, SESSION_COOKIE);
    if (!session) return c.json({ error: 'Unauthorized' }, 401);

    try {
      const user = await createSessionClient(session).account.get();
      return c.json({ user });
    } catch {
      return c.json({ error: 'Unauthorized' }, 401);
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
  });

export default auth;
