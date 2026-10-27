import { Hono, type Context } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { getCookie } from 'hono/cookie';

import { createSessionClient } from '@/app/(auth)/_server/appwrite';
import { SESSION_COOKIE } from '@/app/(auth)/_lib/session';
import { ApiHttpError, UNAUTHORIZED, fromAppwrite, validate } from '@/app/api/_lib/errors';
import { limiters } from '@/app/api/_lib/rate-limit';
import { WORKSPACE_IMAGE_MAX_BYTES } from './appwrite-ids';
import { createWorkspace, getWorkspaceImage, listWorkspaces } from './workspaces';
import { createWorkspaceSchema } from '../_lib/schemas';

const IMAGE_TOO_LARGE = new ApiHttpError(413, {
  code: 'VALIDATION',
  message: 'The image is too large.',
  fields: { image: 'The image is too large.' },
});

function requireSession(c: Context) {
  const session = getCookie(c, SESSION_COOKIE);
  if (!session) throw UNAUTHORIZED;
  return session;
}

const workspaces = new Hono()
  .get('/', async (c) => {
    const session = requireSession(c);
    try {
      return c.json({ workspaces: await listWorkspaces(session) });
    } catch (e) {
      throw fromAppwrite(e, 'workspace');
    }
  })
  .post(
    '/',
    limiters.createWorkspace.byIp(),
    // Reject oversized uploads before parsing them; the margin is for the
    // multipart framing and the name.
    bodyLimit({
      maxSize: WORKSPACE_IMAGE_MAX_BYTES + 64 * 1024,
      onError: () => {
        throw IMAGE_TOO_LARGE;
      },
    }),
    validate('form', createWorkspaceSchema),
    async (c) => {
      const session = requireSession(c);
      const input = c.req.valid('form');

      try {
        const user = await createSessionClient(session).account.get();
        const workspace = await createWorkspace(session, user.$id, input);
        return c.json({ workspace }, 201);
      } catch (e) {
        throw fromAppwrite(e, 'workspace');
      }
    },
  )
  // Images are only readable by the workspace's team, and the browser has no
  // Appwrite session of its own, so they're served through the API.
  .get('/:id/image', async (c) => {
    const session = requireSession(c);
    let image;
    try {
      image = await getWorkspaceImage(session, c.req.param('id'));
    } catch (e) {
      throw fromAppwrite(e, 'workspace');
    }
    if (!image) return c.notFound();

    return c.body(image, 200, {
      'Content-Type': 'image/webp',
      // `?v=` changes when the image does, so it can be cached for long.
      'Cache-Control': 'private, max-age=31536000, immutable',
    });
  });

export default workspaces;
