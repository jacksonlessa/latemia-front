/**
 * Unit tests for the touchpoint storage wrappers.
 *
 * Covers:
 *   - first-wins semantics for `setFirstTouch`
 *   - overwrite semantics for `setLastTouch`
 *   - in-memory fallback when `localStorage`/`sessionStorage` throws
 *   - SSR safety (no `window` access path)
 *   - LGPD: failures never log the value being read/written
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  TOUCHPOINT_STORAGE_KEYS,
  __resetTouchpointMemoryStoreForTests,
  getFirstTouch,
  getLastTouch,
  setFirstTouch,
  setLastTouch,
} from './touchpoint-storage';
import { captureTouchpointFromUrl } from './capture-touchpoints.use-case';

const NOW = new Date('2026-05-04T00:00:00.000Z');

function makeTouchpoint(source: string) {
  return captureTouchpointFromUrl(`?utm_source=${source}`, '', NOW);
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  __resetTouchpointMemoryStoreForTests();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('setFirstTouch / getFirstTouch', () => {
  it('should persist the first-touch value to localStorage on first call', () => {
    const touchpoint = makeTouchpoint('instagram');
    setFirstTouch(touchpoint);

    const raw = window.localStorage.getItem(TOUCHPOINT_STORAGE_KEYS.first);
    expect(raw).not.toBeNull();
    expect(getFirstTouch()).toEqual(touchpoint);
  });

  it('should preserve the existing first-touch (first wins)', () => {
    const original = makeTouchpoint('instagram');
    const newer = makeTouchpoint('meta');

    setFirstTouch(original);
    setFirstTouch(newer);

    expect(getFirstTouch()).toEqual(original);
  });

  it('should return null when nothing has been stored', () => {
    expect(getFirstTouch()).toBeNull();
  });

  it('should ignore unparseable stored values without throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem(TOUCHPOINT_STORAGE_KEYS.first, '{not-json');

    expect(getFirstTouch()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    // LGPD: ensure no warn message contains the raw value.
    for (const call of warnSpy.mock.calls) {
      const joined = call.map(String).join(' ');
      expect(joined).not.toContain('{not-json');
    }
  });
});

describe('setLastTouch / getLastTouch', () => {
  it('should always overwrite the previous last-touch value', () => {
    const first = makeTouchpoint('a');
    const second = makeTouchpoint('b');

    setLastTouch(first);
    setLastTouch(second);

    expect(getLastTouch()).toEqual(second);
  });

  it('should write to sessionStorage (not localStorage)', () => {
    const touchpoint = makeTouchpoint('podcast');
    setLastTouch(touchpoint);

    expect(
      window.sessionStorage.getItem(TOUCHPOINT_STORAGE_KEYS.last),
    ).not.toBeNull();
    expect(
      window.localStorage.getItem(TOUCHPOINT_STORAGE_KEYS.last),
    ).toBeNull();
  });
});

describe('in-memory fallback', () => {
  it('should fall back to memory when localStorage throws on write', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota');
      });

    const touchpoint = makeTouchpoint('safari-private');
    setFirstTouch(touchpoint);

    // localStorage write was attempted and failed.
    expect(setItemSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    // LGPD: the warn payload must not echo the touchpoint value.
    for (const call of warnSpy.mock.calls) {
      const joined = call.map(String).join(' ');
      expect(joined).not.toContain('safari-private');
    }

    // Restore and verify in-memory fallback still serves the value.
    setItemSpy.mockRestore();
    // Need to bypass the read path's localStorage too, otherwise it'd return
    // null. Simulate the read failure on the same browser session.
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });

    expect(getFirstTouch()).toEqual(touchpoint);
    getItemSpy.mockRestore();
  });
});

describe('SSR safety', () => {
  it('should not throw and should return null when window is undefined', () => {
    const originalWindow = globalThis.window;
    // Simulate server-side execution.
    // @ts-expect-error — intentional cleanup for SSR simulation
    delete globalThis.window;

    expect(() => getFirstTouch()).not.toThrow();
    expect(() => getLastTouch()).not.toThrow();
    expect(getFirstTouch()).toBeNull();
    expect(getLastTouch()).toBeNull();

    // Writes should also be safe (memory fallback).
    expect(() => setFirstTouch(makeTouchpoint('x'))).not.toThrow();
    expect(() => setLastTouch(makeTouchpoint('y'))).not.toThrow();

    globalThis.window = originalWindow;
  });
});
