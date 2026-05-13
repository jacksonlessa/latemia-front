/**
 * Unit tests for `sha256Hex`.
 *
 * Uses the standard SHA-256 test vectors (NIST/FIPS 180-2). No PII is
 * involved — only public reference strings.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { sha256Hex } from './crypto';

describe('sha256Hex', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should produce the known SHA-256 vector for "abc"', async () => {
    // RFC 6234 / NIST FIPS 180-2 — SHA-256("abc")
    const expected =
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
    const result = await sha256Hex('abc');
    expect(result).toBe(expected);
  });

  it('should produce the known SHA-256 vector for the empty string', async () => {
    // SHA-256("") — NIST test vector
    const expected =
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const result = await sha256Hex('');
    expect(result).toBe(expected);
  });

  it('should produce a 64-char lowercase hex string for arbitrary input', async () => {
    const result = await sha256Hex('CONTRATO_TEXTO_SAMPLE');
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should return an empty string when crypto.subtle is unavailable', async () => {
    // Replace global crypto with a version missing `subtle` to simulate the
    // legacy/insecure-context fallback path.
    vi.stubGlobal('crypto', { randomUUID: () => 'noop' });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await sha256Hex('abc');
    expect(result).toBe('');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should return an empty string when crypto.subtle.digest is missing', async () => {
    vi.stubGlobal('crypto', { subtle: {} });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await sha256Hex('abc');
    expect(result).toBe('');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
