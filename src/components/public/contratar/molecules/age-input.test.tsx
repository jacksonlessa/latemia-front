import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AgeInput,
  ageToBirthDate,
  birthDateToYearsMonths,
} from './age-input';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('ageToBirthDate', () => {
  it('should subtract years and months from today', () => {
    const today = new Date(2026, 3, 24); // 2026-04-24
    const result = ageToBirthDate(3, 2, today); // 3 anos 2 meses = 38 meses
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(1); // fevereiro
    expect(result.getDate()).toBe(24);
  });

  it('should subtract only years when months is 0', () => {
    const today = new Date(2026, 3, 24);
    const result = ageToBirthDate(3, 0, today);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(3); // abril
    expect(result.getDate()).toBe(24);
  });

  it('should subtract only months when years is 0', () => {
    const today = new Date(2026, 3, 24);
    const result = ageToBirthDate(0, 8, today);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(7); // agosto
    expect(result.getDate()).toBe(24);
  });

  it('should return today when both are 0', () => {
    const today = new Date(2026, 3, 24);
    const result = ageToBirthDate(0, 0, today);
    expect(result.getTime()).toBe(today.getTime());
  });
});

describe('birthDateToYearsMonths', () => {
  it('should split total months into years and remaining months', () => {
    const today = new Date(2026, 3, 24);
    const birth = new Date(2023, 1, 24); // 38 meses atrás
    expect(birthDateToYearsMonths(birth, today)).toEqual({ years: 3, months: 2 });
  });

  it('should return 0 years when total is less than 12 months', () => {
    const today = new Date(2026, 3, 24);
    const birth = new Date(2025, 7, 24); // 8 meses atrás
    expect(birthDateToYearsMonths(birth, today)).toEqual({ years: 0, months: 8 });
  });

  it('should return 0 months when birth is exactly N years ago', () => {
    const today = new Date(2026, 3, 24);
    const birth = new Date(2023, 3, 24); // exatamente 3 anos
    expect(birthDateToYearsMonths(birth, today)).toEqual({ years: 3, months: 0 });
  });

  it('should return 0 years and 0 months when birth is less than 1 month ago', () => {
    const today = new Date(2026, 3, 24);
    const birth = new Date(2026, 3, 10); // ~14 dias
    expect(birthDateToYearsMonths(birth, today)).toEqual({ years: 0, months: 0 });
  });
});

// ---------------------------------------------------------------------------
// Component behavior
// ---------------------------------------------------------------------------

describe('AgeInput component', () => {
  it('should default to approximate mode with two numeric inputs', () => {
    render(<AgeInput onChange={vi.fn()} />);
    expect(screen.getByLabelText('Anos')).toBeInTheDocument();
    expect(screen.getByLabelText('Meses')).toBeInTheDocument();
    expect(screen.queryByLabelText('Data de nascimento')).not.toBeInTheDocument();
  });

  it('should call onChange when typing years', () => {
    const onChange = vi.fn();
    render(<AgeInput onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Anos'), { target: { value: '3' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('should call onChange when typing months', () => {
    const onChange = vi.fn();
    render(<AgeInput onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Meses'), { target: { value: '6' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should compute correct birthDate from years + months', () => {
    const onChange = vi.fn();
    render(<AgeInput onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Anos'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Meses'), { target: { value: '2' } });

    const lastDate = onChange.mock.calls[1][0] as Date;
    const today = new Date();
    const { years, months } = birthDateToYearsMonths(lastDate, today);
    // 3 anos + 2 meses = 38 meses de diferença (tolerância de 1 mês por timezone)
    expect(years * 12 + months).toBeGreaterThanOrEqual(37);
    expect(years * 12 + months).toBeLessThanOrEqual(39);
  });

  it('should switch to exact date mode when toggle is checked', () => {
    render(<AgeInput onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sei a data exata' }));

    expect(screen.getByLabelText('Data de nascimento')).toBeInTheDocument();
    expect(screen.queryByLabelText('Anos')).not.toBeInTheDocument();
  });

  it('should switch back to approximate mode when toggle is unchecked', () => {
    render(<AgeInput onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sei a data exata' }));
    fireEvent.click(screen.getByRole('button', { name: 'Idade aproximada' }));

    expect(screen.getByLabelText('Anos')).toBeInTheDocument();
    expect(screen.queryByLabelText('Data de nascimento')).not.toBeInTheDocument();
  });

  it('should accept a date in exact mode', () => {
    const onChange = vi.fn();
    render(<AgeInput onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sei a data exata' }));
    fireEvent.change(screen.getByLabelText('Data de nascimento'), {
      target: { value: '2024-01-15' },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const date = onChange.mock.calls[0][0] as Date;
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
  });

  it('should restore years and months from value when switching exact → approximate', () => {
    const onChange = vi.fn();
    const today = new Date();
    const birth = new Date(today.getFullYear() - 3, today.getMonth() - 2, today.getDate());

    render(<AgeInput value={birth} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sei a data exata' }));
    fireEvent.click(screen.getByRole('button', { name: 'Idade aproximada' }));

    const yearsInput = screen.getByLabelText('Anos') as HTMLInputElement;
    expect(Number(yearsInput.value)).toBeGreaterThanOrEqual(3);
  });

  it('should initialize approximate inputs from value on edit mode', () => {
    const today = new Date(2026, 3, 24);
    const birth = new Date(2023, 1, 24); // 3 anos 2 meses

    render(<AgeInput value={birth} onChange={vi.fn()} />);

    expect((screen.getByLabelText('Anos') as HTMLInputElement).value).toBe('3');
    expect((screen.getByLabelText('Meses') as HTMLInputElement).value).toBe('2');
  });

  it('should display error message and mark fields as invalid', () => {
    render(<AgeInput onChange={vi.fn()} error="A idade é obrigatória." />);

    expect(screen.getByText('A idade é obrigatória.')).toBeInTheDocument();
    expect(screen.getByLabelText('Anos')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Meses')).toHaveAttribute('aria-invalid', 'true');
  });
});
