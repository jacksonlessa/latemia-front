import { describe, it, expect } from 'vitest';
import {
  SERVICED_CITIES,
  normalizeCityName,
  isServicedCity,
} from './serviced-cities';

describe('normalizeCityName', () => {
  it('should lowercase the input', () => {
    expect(normalizeCityName('ITAJAI')).toBe('itajai');
  });

  it('should remove diacritics from accented characters', () => {
    expect(normalizeCityName('Camboriú')).toBe('camboriu');
    expect(normalizeCityName('Balneário Camboriú')).toBe('balneario camboriu');
  });

  it('should trim leading and trailing spaces', () => {
    expect(normalizeCityName('  itapema  ')).toBe('itapema');
  });

  it('should collapse multiple internal spaces into one', () => {
    expect(normalizeCityName('balneario  camboriu')).toBe('balneario camboriu');
  });

  it('should handle strings with mixed case and accents', () => {
    expect(normalizeCityName('BALNEÁRIO CAMBORIÚ')).toBe('balneario camboriu');
  });
});

describe('isServicedCity', () => {
  it('should return true for Camboriú with accent', () => {
    expect(isServicedCity('Camboriú')).toBe(true);
  });

  it('should return true for Camboriu without accent', () => {
    expect(isServicedCity('Camboriu')).toBe(true);
  });

  it('should return true for CAMBORIU in uppercase', () => {
    expect(isServicedCity('CAMBORIU')).toBe(true);
  });

  it('should return true for Balneário Camboriú', () => {
    expect(isServicedCity('Balneário Camboriú')).toBe(true);
  });

  it('should return true for Balneario Camboriu without accents', () => {
    expect(isServicedCity('Balneario Camboriu')).toBe(true);
  });

  it('should return true for Itapema', () => {
    expect(isServicedCity('Itapema')).toBe(true);
  });

  it('should return true for itapema lowercase', () => {
    expect(isServicedCity('itapema')).toBe(true);
  });

  it('should return true for Itajaí with accent', () => {
    expect(isServicedCity('Itajaí')).toBe(true);
  });

  it('should return true for Itajai without accent', () => {
    expect(isServicedCity('Itajai')).toBe(true);
  });

  it('should return false for a city not serviced — Florianópolis', () => {
    expect(isServicedCity('Florianópolis')).toBe(false);
  });

  it('should return false for a city not serviced — Joinville', () => {
    expect(isServicedCity('Joinville')).toBe(false);
  });

  it('should return false for a city not serviced — São Paulo', () => {
    expect(isServicedCity('São Paulo')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isServicedCity(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isServicedCity(undefined)).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isServicedCity('')).toBe(false);
  });

  it('should return false for a whitespace-only string', () => {
    expect(isServicedCity('   ')).toBe(false);
  });
});

describe('SERVICED_CITIES', () => {
  it('should contain exactly 4 cities', () => {
    expect(SERVICED_CITIES).toHaveLength(4);
  });

  it('should contain all expected canonical city names', () => {
    expect(SERVICED_CITIES).toContain('camboriu');
    expect(SERVICED_CITIES).toContain('balneario camboriu');
    expect(SERVICED_CITIES).toContain('itapema');
    expect(SERVICED_CITIES).toContain('itajai');
  });
});
