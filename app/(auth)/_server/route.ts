import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8),
});

// Chain handlers off a single `new Hono()` so the RPC client infers types.
const auth = new Hono()
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const { email } = c.req.valid('json');

    // TODO: replace with real authentication. Mock data for now.
    return c.json({
      user: { id: 'usr_mock_1', name: 'Mock User', email },
      token: 'mock-token',
    });
  })
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const { name, email } = c.req.valid('json');

    // TODO: replace with real persistence. Mock data for now.
    return c.json(
      {
        user: { id: 'usr_mock_1', name, email },
        token: 'mock-token',
      },
      201,
    );
  });

export default auth;
