/**
 * Idempotency key factory for safe retry of non-idempotent HTTP calls.
 *
 * `createIdempotencyKey` always returns a fresh UUID v4.
 * For the React hook that memoises the key across renders, see
 * `@/hooks/useIdempotencyKey`.
 */

import { generateUUID } from './uuid';

/**
 * Returns a freshly generated UUID v4 to be used as an idempotency key.
 */
export function createIdempotencyKey(): string {
  return generateUUID();
}
