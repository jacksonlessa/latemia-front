'use client';

/**
 * React hook that memoises an idempotency key for a configurable time window.
 *
 * The same key is returned for all renders within `memoryMs` milliseconds.
 * An interval (capped at 10 s) checks for expiry so the key is rotated
 * automatically without triggering state updates during render.
 * `reset()` forces immediate key rotation regardless of the window.
 *
 * Expiry is checked via `useEffect` — never during render — to avoid
 * infinite re-render loops in React 18 Strict Mode.
 *
 * @param memoryMs - Duration in ms for which the key is reused (default 600 000 ms = 10 min)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { generateUUID } from '@/lib/observability/uuid';

export function useIdempotencyKey(memoryMs = 600_000): {
  key: string;
  reset: () => void;
} {
  const [key, setKey] = useState<string>(() => generateUUID());
  const createdAt = useRef<number>(Date.now());

  useEffect(() => {
    const checkExpiry = () => {
      if (Date.now() - createdAt.current >= memoryMs) {
        createdAt.current = Date.now();
        setKey(generateUUID());
      }
    };
    const timer = setInterval(checkExpiry, Math.min(memoryMs, 10_000));
    return () => clearInterval(timer);
  }, [memoryMs]);

  const reset = useCallback(() => {
    createdAt.current = Date.now();
    setKey(generateUUID());
  }, []);

  return { key, reset };
}
