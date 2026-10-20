import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod'

const auth = new Hono();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

auth.post('/login',
  zValidator('json', loginSchema),
  async(c) => {

  const data = c.req.valid('json');

  return c.json({
    data,
    message: 'Hello Next.js!',
  })
})

export default auth;