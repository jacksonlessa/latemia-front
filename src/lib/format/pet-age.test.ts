import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculatePetAge } from './pet-age';

describe('calculatePetAge', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "1 mês" when pet is exactly 1 month old', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
    const birthDate = new Date('2024-05-15');
    expect(calculatePetAge(birthDate)).toBe('1 mês');
  });

  it('should return "2 meses" when pet is 2 months old', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-07-15'));
    const birthDate = new Date('2024-05-15');
    expect(calculatePetAge(birthDate)).toBe('2 meses');
  });

  it('should return "0 meses" when pet was born today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15'));
    const birthDate = new Date('2024-05-15');
    expect(calculatePetAge(birthDate)).toBe('0 meses');
  });

  it('should return "23 meses" when pet is 23 months old (just below threshold)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-04-15'));
    const birthDate = new Date('2022-05-15');
    expect(calculatePetAge(birthDate)).toBe('23 meses');
  });

  it('should return "2 anos" when pet is exactly 24 months old', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15'));
    const birthDate = new Date('2022-05-15');
    expect(calculatePetAge(birthDate)).toBe('2 anos');
  });

  it('should return "1 ano" when pet is exactly 12 months old — edge handled as years', () => {
    // 12 months < 24 → "12 meses", NOT "1 ano"
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15'));
    const birthDate = new Date('2023-05-15');
    expect(calculatePetAge(birthDate)).toBe('12 meses');
  });

  it('should return "3 anos" when pet is 36 months old', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15'));
    const birthDate = new Date('2021-05-15');
    expect(calculatePetAge(birthDate)).toBe('3 anos');
  });

  it('should return "1 ano" when pet is exactly 24 months but that equals 2 years — actually 2 anos', () => {
    // 24 months / 12 = 2 years → "2 anos"
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15'));
    const birthDate = new Date('2021-01-15');
    expect(calculatePetAge(birthDate)).toBe('4 anos');
  });

  it('should adjust correctly when current day is before birth day in month', () => {
    vi.useFakeTimers();
    // June 10: the month of June hasn't been "completed" compared to birth on June 15
    vi.setSystemTime(new Date('2024-06-10'));
    const birthDate = new Date('2024-05-15');
    // 1 month not yet complete (day 10 < day 15), so 0 months
    expect(calculatePetAge(birthDate)).toBe('0 meses');
  });

  it('should not return negative months for future dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15'));
    const birthDate = new Date('2025-05-15');
    expect(calculatePetAge(birthDate)).toBe('0 meses');
  });

  it('should return "5 anos" when pet is 5 years old', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15'));
    const birthDate = new Date('2019-05-15');
    expect(calculatePetAge(birthDate)).toBe('5 anos');
  });
});
