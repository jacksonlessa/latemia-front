/**
 * Unit tests for `digitsToE164`.
 *
 * Covers the canonical shapes consumed by the OTP flow:
 *   - digits-only `11987654321`
 *   - masked `(11) 98765-4321`
 *   - already-prefixed `+5511987654321`
 *   - country-prefixed without `+` (`5511987654321`)
 *   - empty / invalid input (empty string)
 *
 * No PII is logged anywhere.
 */

import { describe, it, expect } from 'vitest';
import { digitsToE164 } from './to-e164';

describe('digitsToE164', () => {
  it('should prepend +55 to a digits-only BR mobile (11 digits)', () => {
    expect(digitsToE164('11987654321')).toBe('+5511987654321');
  });

  it('should prepend +55 to a digits-only BR landline (10 digits)', () => {
    expect(digitsToE164('1133224455')).toBe('+551133224455');
  });

  it('should strip mask characters and return E.164', () => {
    expect(digitsToE164('(11) 98765-4321')).toBe('+5511987654321');
  });

  it('should be idempotent on already-prefixed E.164 BR numbers', () => {
    expect(digitsToE164('+5511987654321')).toBe('+5511987654321');
  });

  it('should preserve a non-BR + prefix as-is (no double prefix)', () => {
    expect(digitsToE164('+15551234567')).toBe('+15551234567');
  });

  it('should add a leading + when input starts with 55 and has full length', () => {
    expect(digitsToE164('5511987654321')).toBe('+5511987654321');
  });

  it('should add the +55 prefix when input has the right BR length but no country code', () => {
    // 10 digits → BR landline → +55 prepended
    expect(digitsToE164('1133224455')).toBe('+551133224455');
  });

  it('should return an empty string when input is empty', () => {
    expect(digitsToE164('')).toBe('');
  });

  it('should return an empty string when input has no digits and no + prefix', () => {
    expect(digitsToE164('()- ')).toBe('');
  });

  it('should not throw and return empty on whitespace input', () => {
    expect(digitsToE164('   ')).toBe('');
  });

  it('should be stable across multiple calls (idempotence under composition)', () => {
    const once = digitsToE164('(11) 98765-4321');
    const twice = digitsToE164(once);
    expect(twice).toBe('+5511987654321');
  });
});
