import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { MoneyInput } from './MoneyInput';

function Harness({ initial = 0 }: { initial?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <MoneyInput id="m" label="Valor" value={value} onChange={setValue} />
      <span data-testid="cents">{value}</span>
    </>
  );
}

/** Simulates a single keystroke being appended at cursor end of the current value. */
function typeDigit(input: HTMLInputElement, digit: string) {
  fireEvent.change(input, { target: { value: input.value + digit } });
}

describe('MoneyInput', () => {
  it('should grow mask from the right when user types digits sequentially', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Valor') as HTMLInputElement;

    typeDigit(input, '1');
    expect(input.value).toBe('0,01');

    typeDigit(input, '4');
    expect(input.value).toBe('0,14');

    typeDigit(input, '5');
    expect(input.value).toBe('1,45');

    typeDigit(input, '0');
    expect(input.value).toBe('14,50');

    typeDigit(input, '0');
    expect(input.value).toBe('145,00');

    typeDigit(input, '0');
    expect(input.value).toBe('1.450,00');

    expect(screen.getByTestId('cents').textContent).toBe('145000');
  });

  it('should ignore non-digit characters typed by the user', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Valor') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'abc1!@#5' } });
    expect(input.value).toBe('0,15');
    expect(screen.getByTestId('cents').textContent).toBe('15');
  });

  it('should remove the last digit when user backspaces a character from display', () => {
    render(<Harness initial={12345} />);
    const input = screen.getByLabelText('Valor') as HTMLInputElement;
    expect(input.value).toBe('123,45');

    fireEvent.change(input, { target: { value: '123,4' } });
    expect(input.value).toBe('12,34');
    expect(screen.getByTestId('cents').textContent).toBe('1234');
  });

  it('should sanitize pasted text to digits only', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Valor') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'abc1.234,56def' } });
    expect(input.value).toBe('1.234,56');
    expect(screen.getByTestId('cents').textContent).toBe('123456');
  });

  it('should display formatted value when the parent provides initial cents', () => {
    render(<Harness initial={9990} />);
    const input = screen.getByLabelText('Valor') as HTMLInputElement;
    expect(input.value).toBe('99,90');
  });

  it('should show empty display when value is zero so placeholder is visible', () => {
    render(<Harness initial={0} />);
    const input = screen.getByLabelText('Valor') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('0,00');
  });

  it('should call onChange with cents on every keystroke', () => {
    const onChange = vi.fn();
    render(<MoneyInput id="m" label="Valor" value={0} onChange={onChange} />);
    const input = screen.getByLabelText('Valor') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '5' } });
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('should resync display when the parent changes value externally', () => {
    const { rerender } = render(
      <MoneyInput id="m" label="Valor" value={0} onChange={() => undefined} />,
    );
    const input = screen.getByLabelText('Valor') as HTMLInputElement;
    expect(input.value).toBe('');

    rerender(<MoneyInput id="m" label="Valor" value={250000} onChange={() => undefined} />);
    expect(input.value).toBe('2.500,00');
  });

  it('should cap input at 13 digits to prevent overflow', () => {
    render(<Harness />);
    const input = screen.getByLabelText('Valor') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '12345678901234567' } });
    expect(input.value).toBe('12.345.678.901,23');
    expect(screen.getByTestId('cents').textContent).toBe('1234567890123');
  });
});
