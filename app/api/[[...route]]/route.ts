import { Hono } from 'hono';
import { handle } from '@hono/vercel';
import auth from '@/app/(auth)/_server/route';
import { notFound, onError } from '@/app/api/_lib/errors';
import { limiters } from '@/app/api/_lib/rate-limit';


export const app = new Hono().basePath('/api');

app.onError(onError);
app.notFound(notFound);
app.use('*', limiters.api.byIp());

const routes = app.route('/auth', auth);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export type AppType = typeof routes;
