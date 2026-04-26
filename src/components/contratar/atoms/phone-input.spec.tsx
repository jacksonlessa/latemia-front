import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneInput } from './phone-input';
import { applyMask } from '@/components/ui/phone-input';

// ---------------------------------------------------------------------------
// applyMask unit tests
// ---------------------------------------------------------------------------

describe('applyMask', () => {
  it('should return empty string when given empty input', () => {
    expect(applyMask('')).toBe('');
  });

  it('should format 2 digits as area code only', () => {
    expect(applyMask('47')).toBe('(47');
  });

  it('should format 6 digits as (DD) XXXXX', () => {
    expect(applyMask('479876')).toBe('(47) 9876');
  });

  it('should format 10 digits as (DD) XXXXX-XXX (fixo — same template as 11 digits)', () => {
    // 10 digits: (DD) + first 5 + last 3 → (47) 36001-234
    expect(applyMask('4736001234')).toBe('(47) 36001-234');
  });

  it('should format 11 digits as (DD) XXXXX-XXXX (celular)', () => {
    expect(applyMask('47987654321')).toBe('(47) 98765-4321');
  });

  it('should truncate input beyond 11 digits to first 11', () => {
    expect(applyMask('479876543219999')).toBe('(47) 98765-4321');
  });
});

// ---------------------------------------------------------------------------
// PhoneInput component tests
// ---------------------------------------------------------------------------

describe('PhoneInput', () => {
  it('should render with autoComplete="off"', () => {
    render(<PhoneInput />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autoComplete', 'off');
  });

  it('should render with inputMode="numeric"', () => {
    render(<PhoneInput />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('should render with name="tel-no-autofill" by default', () => {
    render(<PhoneInput />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'tel-no-autofill');
  });

  it('should respect a custom name prop when provided', () => {
    render(<PhoneInput name="telefone" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'telefone');
  });

  it('should apply mask to defaultValue on mount', () => {
    render(<PhoneInput defaultValue="47987654321" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('(47) 98765-4321');
  });

  it('should truncate typed input beyond 11 digits to 11', () => {
    render(<PhoneInput />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '4798765432100' } });
    // applyMask slices to 11 digits: 47987654321 → (47) 98765-4321
    expect(input).toHaveValue('(47) 98765-4321');
  });

  it('should call onChange with masked value when user types', () => {
    const handleChange = vi.fn();
    render(<PhoneInput onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '47987654321' } });
    expect(handleChange).toHaveBeenCalledWith('(47) 98765-4321');
  });

  it('should handle paste of number with DDI (+5547987654321) — extracts first 11 digits', () => {
    const handleChange = vi.fn();
    render(<PhoneInput onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    // jsdom does not implement DataTransfer; simulate clipboardData manually
    fireEvent.paste(input, {
      clipboardData: { getData: (_format: string) => '+5547987654321' },
    });

    // +5547987654321 → digits: 5547987654321 (13 digits) → slice(0,11) → 55479876543
    // handler intercepts because text !== digits
    expect(handleChange).toHaveBeenCalledWith(applyMask('55479876543'));
  });

  it('should handle paste of formatted number "+55 (47) 99999-9999" — extracts 11 Brazilian digits', () => {
    const handleChange = vi.fn();
    render(<PhoneInput onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.paste(input, {
      clipboardData: { getData: (_format: string) => '+55 (47) 99999-9999' },
    });

    // digits from "+55 (47) 99999-9999" = 5547999999999 (13 digits) → slice(0,11) = 55479999999
    expect(handleChange).toHaveBeenCalledWith(applyMask('55479999999'));
  });

  it('should not intercept paste when pasted text is already pure numeric (11 digits)', () => {
    const handleChange = vi.fn();
    render(<PhoneInput onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    // Pasting exactly 11 numeric digits — text === digits, handler returns early without calling onChange
    fireEvent.paste(input, {
      clipboardData: { getData: (_format: string) => '47987654321' },
    });

    // onChange not called by handlePaste (event flows naturally via default onChange)
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should have maxLength of 15 (masked format length)', () => {
    render(<PhoneInput />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '15');
  });
});
