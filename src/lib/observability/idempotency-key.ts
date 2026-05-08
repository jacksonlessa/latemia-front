/**
 * Idempotency key utilities for safe retry of non-idempotent HTTP calls.
 *
 * `createIdempotencyKey` always returns a fresh UUID v4.
 * `useIdempotencyKey` acts as a simple in-memory hook that memoises the key
 * for a configurable window (default 10 minutes), resetting automatically
 * after expiry or on demand.
 */

import { useCallback, useRef, useState } from 'react';

/**
 * Generates a UUID v4 using the Web Crypto API when available, falling back
 * to a Math.random-based implementation.
 */
function generateUUID(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns a freshly generated UUID v4.
 */
export function createIdempotencyKey(): string {
  return generateUUID();
}

/**
 * React hook that memoises an idempotency key for a configurable time window.
 *
 * The same key is returned for all calls within `memoryMs` milliseconds.
 * After the window expires, the next call generates and stores a new key.
 * `reset()` forces immediate key rotation regardless of the window.
 *
 * @param memoryMs - Duration in ms for which the key is reused (default 600 000 ms = 10 min)
 */
export function useIdempotencyKey(memoryMs: number = 600_000): {
  key: string;
  reset: () => void;
} {
  // Use state so that reset() triggers a re-render and consumers see the new key
  const [key, setKey] = useState<string>(() => generateUUID());
  const expiresAtRef = useRef<number>(Date.now() + memoryMs);

  // Check expiry on every render; update state if window has passed
  const resolvedKey = (() => {
    if (Date.now() > expiresAtRef.current) {
      const next = generateUUID();
      expiresAtRef.current = Date.now() + memoryMs;
      // Schedule a state update; React batches this appropriately
      setKey(next);
      return next;
    }
    return key;
  })();

  const reset = useCallback((): void => {
    expiresAtRef.current = Date.now() + memoryMs;
    setKey(generateUUID());
  }, [memoryMs]);

  return { key: resolvedKey, reset };
}
