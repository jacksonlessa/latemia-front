/**
 * Manages the per-attempt request ID used for end-to-end tracing.
 *
 * The ID is stored in sessionStorage under the key `latemia.attemptId` so it
 * persists across navigation within the same browser tab, but is discarded
 * when the tab is closed. During SSR (server-side rendering) the module
 * returns a temporary UUID without attempting to access sessionStorage.
 */

import { generateUUID } from './uuid';

const SESSION_KEY = 'latemia.attemptId';

/**
 * Returns the current attempt ID from sessionStorage, creating and persisting
 * a new one if none exists yet.
 *
 * SSR-safe: when called on the server (`typeof window === 'undefined'`) it
 * returns a fresh UUID without persisting anywhere.
 */
export function getOrCreateAttemptId(): string {
  if (typeof window === 'undefined') {
    return generateUUID();
  }

  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const id = generateUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

/**
 * Generates a new UUID, overwrites the stored attempt ID and returns it.
 *
 * SSR-safe: when called on the server it returns a fresh UUID without
 * persisting anywhere.
 */
export function resetAttemptId(): string {
  const id = generateUUID();

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, id);
  }

  return id;
}
