import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardExpiryInput, isValidExpiry, maskCardExpiry } from './card-expiry-input';

describe('maskCardExpiry', () => {
  it('should insert slash after 2 digits', () => {
    expect(maskCardExpiry('1230')).toBe('12/30');
  });

  it('should leave under 2 digits without slash', () => {
    expect(maskCardExpiry('1')).toBe('1');
  });

  it('should clamp to 4 digits', () => {
    expect(maskCardExpiry('123056')).toBe('12/30');
  });
});

describe('isValidExpiry', () => {
  it('should accept months 01..12 with 4 digits', () => {
    expect(isValidExpiry('1230')).toBe(true);
    expect(isValidExpiry('0125')).toBe(true);
  });

  it('should reject month 0 or 13', () => {
    expect(isValidExpiry('0030')).toBe(false);
    expect(isValidExpiry('1330')).toBe(false);
  });

  it('should reject incomplete values', () => {
    expect(isValidExpiry('123')).toBe(false);
  });
});

describe('CardExpiryInput', () => {
  it('should render with cc-exp autocomplete', () => {
    render(<CardExpiryInput value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Validade');
    expect(input).toHaveAttribute('autocomplete', 'cc-exp');
  });

  it('should propagate digits-only value via onChange', () => {
    const onChange = vi.fn();
    render(<CardExpiryInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Validade'), { target: { value: '12/30' } });
    expect(onChange).toHaveBeenCalledWith('1230');
  });

  it('should apply aria-invalid when error present', () => {
    render(<CardExpiryInput value="" onChange={() => {}} error="Validade inválida" />);
    expect(screen.getByLabelText('Validade')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Validade inválida')).toBeInTheDocument();
  });
});
