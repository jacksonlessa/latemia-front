import { describe, it, expect } from 'vitest';
import { hashStack } from './stack-hash';

describe('hashStack', () => {
  it('should return 16-char hex string when crypto.subtle is available', async () => {
    const result = await hashStack('Error: something failed\n  at foo.ts:10');
    expect(result).toMatch(/^[a-f0-9]{16}$/);
  });

  it('should return empty string when crypto is unavailable (SSR)', async () => {
    const originalCrypto = global.crypto;
    // @ts-expect-error simulating SSR environment
    delete global.crypto;
    const result = await hashStack('any stack');
    expect(result).toBe('');
    global.crypto = originalCrypto;
  });

  it('should be idempotent — same input always produces same hash', async () => {
    const stack = 'Error: deterministic\n  at bar.ts:42';
    const [r1, r2] = await Promise.all([hashStack(stack), hashStack(stack)]);
    expect(r1).toBe(r2);
    expect(r1.length).toBe(16);
  });

  it('should return a string for empty input without throwing', async () => {
    const result = await hashStack('');
    expect(typeof result).toBe('string');
  });
});
