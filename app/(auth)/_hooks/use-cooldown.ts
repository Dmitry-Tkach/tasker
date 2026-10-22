import { useEffect, useState } from 'react';

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

/** How long to block resubmitting after a RATE_LIMITED response. */
export const RATE_LIMIT_COOLDOWN_SECONDS = 60;
