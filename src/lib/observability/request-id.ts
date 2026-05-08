/**
 * Manages the per-attempt request ID used for end-to-end tracing.
 *
 * The ID is stored in sessionStorage under the key `latemia.attemptId` so it
 * persists across navigation within the same browser tab, but is discarded
 * when the tab is closed. During SSR (server-side rendering) the module
 * returns a temporary UUID without attempting to access sessionStorage.
 */

const SESSION_KEY = 'latemia.attemptId';

/**
 * Generates a UUID v4 using the Web Crypto API when available, falling back
 * to a Math.random-based implementation for environments that lack it.
 */
function generateUUID(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  // Fallback: Math.random-based UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
