import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardCvvInput } from './card-cvv-input';

describe('CardCvvInput', () => {
  it('should render with cc-csc autocomplete and numeric inputMode', () => {
    render(<CardCvvInput value="" onChange={() => {}} />);
    const input = screen.getByLabelText('CVV');
    expect(input).toHaveAttribute('autocomplete', 'cc-csc');
    expect(input).toHaveAttribute('inputmode', 'numeric');
  });

  it('should clamp input to maxDigits=3 when configured', () => {
    const onChange = vi.fn();
    render(<CardCvvInput value="" onChange={onChange} maxDigits={3} />);
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '12345' } });
    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('should drop non-digit characters', () => {
    const onChange = vi.fn();
    render(<CardCvvInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: 'a1b2c3' } });
    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('should show error and aria-invalid', () => {
    render(<CardCvvInput value="" onChange={() => {}} error="CVV inválido" />);
    expect(screen.getByLabelText('CVV')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('CVV inválido')).toBeInTheDocument();
  });
});
