import type { Context, MiddlewareHandler } from 'hono';
import { ApiHttpError } from './errors';

// Fixed-window request limiter kept in this process's memory. Counters reset
// on restart and aren't shared between instances; that's fine while the app
// runs as a single Railway instance. Move the store to Redis before scaling out.

type Window = { count: number; resetAt: number };

const SWEEP_INTERVAL_MS = 60_000;

export interface RateLimiter {
  /** Counts one request for `key`; throws a 429 ApiHttpError once over the limit. */
  check(key: string): void;
  /** Middleware that counts every request, keyed by client IP. */
  byIp(): MiddlewareHandler;
}

export function createRateLimiter({
  name,
  limit,
  windowMs,
}: {
  /** Namespaces the keys and labels log lines. */
  name: string;
  /** Requests allowed per key per window. */
  limit: number;
  windowMs: number;
}): RateLimiter {
  const windows = new Map<string, Window>();
  let nextSweep = Date.now() + SWEEP_INTERVAL_MS;

  // Drop expired windows now and then so the map doesn't grow without bound.
  const sweep = (now: number) => {
    if (now < nextSweep) return;
    nextSweep = now + SWEEP_INTERVAL_MS;
    for (const [key, window] of windows) {
      if (window.resetAt <= now) windows.delete(key);
    }
  };

  const check = (key: string) => {
    const now = Date.now();
    sweep(now);

    let window = windows.get(key);
    if (!window || window.resetAt <= now) {
      window = { count: 0, resetAt: now + windowMs };
      windows.set(key, window);
    }

    window.count += 1;
    if (window.count > limit) {
      const retryAfter = Math.max(1, Math.ceil((window.resetAt - now) / 1000));
      if (window.count === limit + 1) console.warn(`[rate-limit:${name}] limit hit for ${key}`);
      throw new ApiHttpError(429, {
        code: 'RATE_LIMITED',
        message: `Too many attempts. Please try again in ${formatWait(retryAfter)}.`,
        retryAfter,
      });
    }
  };

  return {
    check,
    byIp: () => async (c, next) => {
      check(getClientIp(c));
      await next();
    },
  };
}

/**
 * The caller's IP. Railway's edge proxy sets X-Real-IP to the client's address
 * (its documented header). X-Forwarded-For is only a fallback for other
 * hosts/local dev: on Railway it passes client-supplied values through, so it
 * can be spoofed (verified against production).
 */
export function getClientIp(c: Context): string {
  const realIp = c.req.header('x-real-ip')?.trim();
  if (realIp) return realIp;
  const forwarded = c.req.header('x-forwarded-for');
  return forwarded?.split(',').at(-1)?.trim() || 'unknown';
}

function formatWait(seconds: number) {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

const MINUTE = 60_000;

// Limits for the auth endpoints. Per-IP limits stop one client hammering an
// endpoint; the per-account ones stop a distributed attempt on one email.
export const limiters = {
  /** Every /api request. */
  api: createRateLimiter({ name: 'api', limit: 300, windowMs: MINUTE }),
  login: createRateLimiter({ name: 'login', limit: 20, windowMs: 15 * MINUTE }),
  /**
   * Keyed by IP + email rather than email alone, so an attacker can't lock a
   * real user out of their account by failing logins for them.
   */
  loginAccount: createRateLimiter({ name: 'login-account', limit: 5, windowMs: 15 * MINUTE }),
  register: createRateLimiter({ name: 'register', limit: 5, windowMs: 60 * MINUTE }),
  recoveryRequest: createRateLimiter({ name: 'recovery-request', limit: 5, windowMs: 60 * MINUTE }),
  /** Caps reset emails to one address, so nobody can flood someone's inbox. */
  recoveryEmail: createRateLimiter({ name: 'recovery-email', limit: 3, windowMs: 60 * MINUTE }),
  recoveryConfirm: createRateLimiter({ name: 'recovery-confirm', limit: 10, windowMs: 15 * MINUTE }),
  createWorkspace: createRateLimiter({ name: 'create-workspace', limit: 10, windowMs: 60 * MINUTE }),
};
