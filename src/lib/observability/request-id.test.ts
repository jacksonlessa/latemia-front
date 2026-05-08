/**
 * Unit tests for request-id utilities.
 *
 * sessionStorage is provided by jsdom (vitest environment). We test SSR
 * behaviour by temporarily deleting `globalThis.window`.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getOrCreateAttemptId,
  resetAttemptId,
} from './request-id';

const SESSION_KEY = 'latemia.attemptId';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('getOrCreateAttemptId', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should generate a UUID v4 when no attempt ID is stored', () => {
    const id = getOrCreateAttemptId();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('should persist the generated ID in sessionStorage', () => {
    const id = getOrCreateAttemptId();
    expect(sessionStorage.getItem(SESSION_KEY)).toBe(id);
  });

  it('should return the same ID on consecutive calls without reset', () => {
    const first = getOrCreateAttemptId();
    const second = getOrCreateAttemptId();
    expect(first).toBe(second);
  });

  it('should return the existing ID when sessionStorage already has one', () => {
    sessionStorage.setItem(SESSION_KEY, 'preset-id');
    const id = getOrCreateAttemptId();
    expect(id).toBe('preset-id');
  });
});

describe('resetAttemptId', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should generate a new UUID v4', () => {
    const id = resetAttemptId();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('should overwrite the previously stored attempt ID', () => {
    const first = getOrCreateAttemptId();
    const second = resetAttemptId();
    expect(second).not.toBe(first);
    expect(sessionStorage.getItem(SESSION_KEY)).toBe(second);
  });

  it('should make getOrCreateAttemptId return the new ID after reset', () => {
    getOrCreateAttemptId();
    const after = resetAttemptId();
    const retrieved = getOrCreateAttemptId();
    expect(retrieved).toBe(after);
  });
});

describe('SSR guard (typeof window === undefined)', () => {
  // Save and restore window after the test block
  let savedWindow: Window & typeof globalThis;

  beforeEach(() => {
    savedWindow = globalThis.window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = undefined;
  });

  afterEach(() => {
    globalThis.window = savedWindow;
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return a UUID v4 from getOrCreateAttemptId without throwing', () => {
    const id = getOrCreateAttemptId();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('should return a UUID v4 from resetAttemptId without throwing', () => {
    const id = resetAttemptId();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('should return different UUIDs on consecutive SSR calls (no sessionStorage)', () => {
    const a = getOrCreateAttemptId();
    const b = getOrCreateAttemptId();
    // Without sessionStorage every call generates a new UUID
    expect(a).not.toBe(b);
  });
});
