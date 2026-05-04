/**
 * SSR-safe wrappers over `localStorage` (firstTouch) and `sessionStorage`
 * (lastTouch). Falls back to in-memory storage when the Web Storage API is
 * unavailable (Safari private mode, iOS WebView, server-side rendering).
 *
 * LGPD: failures are silenced via a generic `console.warn` — values are
 * NEVER logged because they may include campaign-specific identifiers
 * classified as indirect personal data.
 *
 * Versioned keys allow future schema changes to invalidate stale data without
 * a migration step (just bump the version suffix).
 */

import type { Touchpoint } from './touchpoints.types';

const FIRST_TOUCH_KEY = 'lm_first_touch_v1';
const LAST_TOUCH_KEY = 'lm_last_touch_v1';

const memoryStore: Record<string, string> = {};

type StorageKind = 'local' | 'session';

function getStorage(kind: StorageKind): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function safeRead(kind: StorageKind, key: string): string | null {
  const storage = getStorage(kind);
  if (storage !== null) {
    try {
      return storage.getItem(key);
    } catch {
      console.warn('[touchpoints] storage read failed; falling back to memory');
    }
  }
  return memoryStore[key] ?? null;
}

function safeWrite(kind: StorageKind, key: string, value: string): void {
  const storage = getStorage(kind);
  if (storage !== null) {
    try {
      storage.setItem(key, value);
      memoryStore[key] = value;
      return;
    } catch {
      console.warn('[touchpoints] storage write failed; falling back to memory');
    }
  }
  memoryStore[key] = value;
}

function parseTouchpoint(raw: string | null): Touchpoint | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') {
      return null;
    }
    // Trust the shape: stored values are always written by `setFirstTouch` /
    // `setLastTouch` which receive a typed `Touchpoint`. Bumping the storage
    // key version is the migration strategy for shape changes.
    return parsed as Touchpoint;
  } catch {
    console.warn('[touchpoints] storage parse failed; ignoring stale value');
    return null;
  }
}

function serializeTouchpoint(touchpoint: Touchpoint): string {
  return JSON.stringify(touchpoint);
}

export function getFirstTouch(): Touchpoint | null {
  return parseTouchpoint(safeRead('local', FIRST_TOUCH_KEY));
}

/**
 * Persists the first-touch value following the "first wins" rule:
 * if a value already exists, it is preserved.
 *
 * Consent gating: callers must only invoke this when marketing consent is
 * granted. The `TouchpointProvider` already enforces that — without consent,
 * the provider keeps the touchpoint in memory and never reaches this writer
 * (PRD §1.7 LGPD).
 */
export function setFirstTouch(touchpoint: Touchpoint): void {
  const existing = getFirstTouch();
  if (existing !== null) return;
  safeWrite('local', FIRST_TOUCH_KEY, serializeTouchpoint(touchpoint));
}

export function getLastTouch(): Touchpoint | null {
  return parseTouchpoint(safeRead('session', LAST_TOUCH_KEY));
}

/**
 * Persists the last-touch value (always overwrites, scoped to the session).
 *
 * Consent gating: same contract as `setFirstTouch` — only call when marketing
 * consent is granted; otherwise the provider keeps the value in memory.
 */
export function setLastTouch(touchpoint: Touchpoint): void {
  safeWrite('session', LAST_TOUCH_KEY, serializeTouchpoint(touchpoint));
}

/**
 * Test-only helper. Clears the in-memory fallback store. Not exported from
 * the package barrel — imported directly from tests.
 */
export function __resetTouchpointMemoryStoreForTests(): void {
  for (const key of Object.keys(memoryStore)) {
    delete memoryStore[key];
  }
}

export const TOUCHPOINT_STORAGE_KEYS = {
  first: FIRST_TOUCH_KEY,
  last: LAST_TOUCH_KEY,
} as const;
