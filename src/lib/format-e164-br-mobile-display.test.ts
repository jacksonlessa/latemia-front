import { describe, expect, it } from 'vitest';
import { formatE164BrMobileDisplay } from './format-e164-br-mobile-display';

describe('formatE164BrMobileDisplay', () => {
  it('should format a valid E.164 BR mobile with full digits', () => {
    expect(formatE164BrMobileDisplay('+5511987654321')).toBe('(11) 98765-4321');
  });

  it('should format another DDD correctly', () => {
    expect(formatE164BrMobileDisplay('+5547995221932')).toBe('(47) 99522-1932');
  });

  it('should return empty string for landline-length E.164', () => {
    expect(formatE164BrMobileDisplay('+551133224455')).toBe('');
  });

  it('should return empty string for empty or non-string-like empty', () => {
    expect(formatE164BrMobileDisplay('')).toBe('');
  });

  it('should return empty string when country code is missing', () => {
    expect(formatE164BrMobileDisplay('11987654321')).toBe('');
  });

  it('should return empty string for non-BR prefix', () => {
    expect(formatE164BrMobileDisplay('+14155552671')).toBe('');
  });
});
