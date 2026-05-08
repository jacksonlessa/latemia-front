/**
 * Unit tests for idempotency-key utilities.
 *
 * `createIdempotencyKey` is a pure function tested directly.
 * `useIdempotencyKey` lives in `@/hooks/useIdempotencyKey` and is tested
 * via `renderHook` from @testing-library/react. Fake timers are used to
 * control interval-based window expiry.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createIdempotencyKey } from './idempotency-key';
import { useIdempotencyKey } from '@/hooks/useIdempotencyKey';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('createIdempotencyKey', () => {
  it('should generate a UUID v4', () => {
    const key = createIdempotencyKey();
    expect(key).toMatch(UUID_V4_REGEX);
  });

  it('should generate a different key on every call', () => {
    const a = createIdempotencyKey();
    const b = createIdempotencyKey();
    expect(a).not.toBe(b);
  });
});

describe('useIdempotencyKey', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return a UUID v4', () => {
    const { result } = renderHook(() => useIdempotencyKey());
    expect(result.current.key).toMatch(UUID_V4_REGEX);
  });

  it('should return the same key within the memory window', () => {
    const { result } = renderHook(() => useIdempotencyKey(60_000));
    const first = result.current.key;

    act(() => {
      vi.advanceTimersByTime(30_000); // advance half the window
    });

    expect(result.current.key).toBe(first);
  });

  it('should return a new key after the window expires', () => {
    const { result } = renderHook(() => useIdempotencyKey(60_000));
    const first = result.current.key;

    act(() => {
      vi.advanceTimersByTime(70_000); // advance past the window (interval fires at 10s intervals)
    });

    expect(result.current.key).not.toBe(first);
    expect(result.current.key).toMatch(UUID_V4_REGEX);
  });

  it('should return a new key immediately after reset()', () => {
    const { result } = renderHook(() => useIdempotencyKey(600_000));
    const first = result.current.key;

    act(() => {
      result.current.reset();
    });

    expect(result.current.key).not.toBe(first);
    expect(result.current.key).toMatch(UUID_V4_REGEX);
  });

  it('should expose a reset function', () => {
    const { result } = renderHook(() => useIdempotencyKey());
    expect(typeof result.current.reset).toBe('function');
  });
});
