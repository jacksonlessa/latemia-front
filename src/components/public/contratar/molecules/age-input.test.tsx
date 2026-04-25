import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AgeInput,
  ageToBirthDate,
  birthDateToApproximate,
} from './age-input';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('ageToBirthDate', () => {
  it('should subtract N years (in months) from today when unit is anos', () => {
    const today = new Date(2026, 3, 24); // 2026-04-24
    const result = ageToBirthDate(3, 'anos', today);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(24);
  });

  it('should subtract N months from today when unit is meses', () => {
    const today = new Date(2026, 3, 24); // 2026-04-24
    const result = ageToBirthDate(8, 'meses', today);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(7); // August (0-indexed)
    expect(result.getDate()).toBe(24);
  });

  it('should return today when value is 0', () => {
    const today = new Date(2026, 3, 24);
    const result = ageToBirthDate(0, 'anos', today);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(24);
  });
});

describe('birthDateToApproximate', () => {
  it('should return years (floor) when birth is at least 24 months ago', () => {
    const today = new Date(2026, 3, 24);
    const birth = new Date(2023, 3, 24);
    expect(birthDateToApproximate(birth, today)).toEqual({ value: 3, unit: 'anos' });
  });

  it('should return months when birth is less than 24 months ago', () => {
    const today = new Date(2026, 3, 24);
    const birth = new Date(2025, 7, 24); // 8 months ago
    expect(birthDateToApproximate(birth, today)).toEqual({ value: 8, unit: 'meses' });
  });

  it('should return 0 meses when birth is less than 1 month ago', () => {
    const today = new Date(2026, 3, 24);
    const birth = new Date(2026, 3, 10); // ~14 days ago
    expect(birthDateToApproximate(birth, today)).toEqual({ value: 0, unit: 'meses' });
  });

  it('should floor down years (38 months → 3 anos)', () => {
    const today = new Date(2026, 3, 24);
    const birth = new Date(2023, 1, 24); // 38 months ago
    expect(birthDateToApproximate(birth, today)).toEqual({ value: 3, unit: 'anos' });
  });
});

// ---------------------------------------------------------------------------
// Component behavior
// ---------------------------------------------------------------------------

describe('AgeInput component', () => {
  it('should default to approximate mode and call onChange when typing the number', () => {
    const onChange = vi.fn();
    render(<AgeInput onChange={onChange} />);

    const numberInput = screen.getByLabelText('Idade aproximada') as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '3' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const date = onChange.mock.calls[0][0] as Date;
    expect(date).toBeInstanceOf(Date);
  });

  it('should compute different birthDate when unit changes from anos to meses', () => {
    const onChange = vi.fn();
    render(<AgeInput onChange={onChange} />);

    const numberInput = screen.getByLabelText('Idade aproximada') as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '6' } });

    const unitSelect = screen.getByLabelText('Unidade') as HTMLSelectElement;
    fireEvent.change(unitSelect, { target: { value: 'meses' } });

    expect(onChange).toHaveBeenCalledTimes(2);
    const yearsDate = onChange.mock.calls[0][0] as Date;
    const monthsDate = onChange.mock.calls[1][0] as Date;
    // 6 years vs 6 months — different
    expect(yearsDate.getTime()).not.toBe(monthsDate.getTime());
  });

  it('should switch to exact mode and accept a date input', () => {
    const onChange = vi.fn();
    render(<AgeInput onChange={onChange} />);

    fireEvent.click(screen.getByText('Sei a data exata'));

    const dateInput = screen.getByLabelText('Data de nascimento') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const date = onChange.mock.calls[0][0] as Date;
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
  });

  it('should preserve canonical value when switching exact → approximate', () => {
    const onChange = vi.fn();
    const today = new Date();
    const birth = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());

    const { rerender } = render(<AgeInput value={birth} onChange={onChange} />);

    // Approximate mode shows "3 anos"
    expect((screen.getByLabelText('Idade aproximada') as HTMLInputElement).value).toBe('3');

    // Switch to exact
    fireEvent.click(screen.getByText('Sei a data exata'));
    expect(screen.getByLabelText('Data de nascimento')).toBeInTheDocument();

    // Switch back to approximate — value should still derive to "3 anos"
    fireEvent.click(screen.getByText('Voltar para idade aproximada'));
    rerender(<AgeInput value={birth} onChange={onChange} />);
    expect((screen.getByLabelText('Idade aproximada') as HTMLInputElement).value).toBe('3');
  });

  it('should display the error message and mark fields as invalid', () => {
    const onChange = vi.fn();
    render(<AgeInput onChange={onChange} error="A idade é obrigatória." />);

    expect(screen.getByText('A idade é obrigatória.')).toBeInTheDocument();
    const numberInput = screen.getByLabelText('Idade aproximada') as HTMLInputElement;
    expect(numberInput).toHaveAttribute('aria-invalid', 'true');
  });
});
