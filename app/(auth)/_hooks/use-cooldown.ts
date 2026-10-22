import { useEffect, useState } from 'react';
import type { ApiError } from '@/lib/api-error';

/** Seconds-remaining countdown. Call `start(seconds)` to begin; reaches 0 on its own. */
export function useCooldown() {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  return [remaining, setRemaining] as const;
}

/** Seconds to block resubmitting after a RATE_LIMITED error (the server's Retry-After). */
export const rateLimitWait = (error: ApiError) => error.retryAfter ?? 60;

/** "45s" or "14:05" for button labels. */
export function formatCooldown(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}
