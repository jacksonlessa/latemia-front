import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardNumberInput, maskCardNumber } from './card-number-input';

describe('maskCardNumber', () => {
  it('should format digits in 4-4-4-4 groups', () => {
    expect(maskCardNumber('4000000000000010')).toBe('4000 0000 0000 0010');
  });

  it('should drop non-digit characters', () => {
    expect(maskCardNumber('4000-abc-0000-0000-0010')).toBe('4000 0000 0000 0010');
  });

  it('should clamp to maxDigits (default 19)', () => {
    expect(maskCardNumber('1234567890123456789012345')).toBe('1234 5678 9012 3456 789');
  });
});

describe('CardNumberInput', () => {
  it('should render with cc-number autocomplete and numeric inputMode', () => {
    render(<CardNumberInput value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Número do cartão') as HTMLInputElement;
    expect(input).toHaveAttribute('autocomplete', 'cc-number');
    expect(input).toHaveAttribute('inputmode', 'numeric');
  });

  it('should call onChange with digits-only when user types masked value', () => {
    const onChange = vi.fn();
    render(<CardNumberInput value="" onChange={onChange} />);
    const input = screen.getByLabelText('Número do cartão');
    fireEvent.change(input, { target: { value: '4000 0000 0000 0010' } });
    expect(onChange).toHaveBeenCalledWith('4000000000000010');
  });

  it('should expose error via aria-invalid and inline message', () => {
    render(<CardNumberInput value="" onChange={() => {}} error="Número inválido" />);
    const input = screen.getByLabelText('Número do cartão');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Número inválido')).toBeInTheDocument();
  });
});
