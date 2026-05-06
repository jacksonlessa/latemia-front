import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CardForm, EMPTY_CARD_FORM_VALUE, type CardFormProps } from './card-form';

function setup(overrides: Partial<CardFormProps> = {}) {
  const onChange = vi.fn();
  const props: CardFormProps = {
    value: EMPTY_CARD_FORM_VALUE,
    onChange,
    ...overrides,
  };
  const utils = render(<CardForm {...props} />);
  return { ...utils, onChange, props };
}

describe('CardForm', () => {
  it('should render the four card atoms', () => {
    setup();
    expect(screen.getByLabelText('Número do cartão')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome impresso no cartão')).toBeInTheDocument();
    expect(screen.getByLabelText('Validade')).toBeInTheDocument();
    expect(screen.getByLabelText('CVV')).toBeInTheDocument();
  });

  it('should call onChange with the matching field key', () => {
    const { onChange } = setup();
    fireEvent.change(screen.getByLabelText('Número do cartão'), {
      target: { value: '4000 0000 0000 0010' },
    });
    expect(onChange).toHaveBeenCalledWith('number', '4000000000000010');

    fireEvent.change(screen.getByLabelText('Validade'), { target: { value: '12/30' } });
    expect(onChange).toHaveBeenCalledWith('expiry', '1230');

    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
    expect(onChange).toHaveBeenCalledWith('cvv', '123');
  });

  it('should render inline errors and aria-invalid per field', () => {
    setup({
      errors: {
        number: 'Número inválido',
        expiry: 'Validade inválida',
        cvv: 'CVV inválido',
        holderName: 'Nome obrigatório',
      },
    });
    expect(screen.getByLabelText('Número do cartão')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Validade')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('CVV')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Nome impresso no cartão')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Número inválido')).toBeInTheDocument();
    expect(screen.getByText('Validade inválida')).toBeInTheDocument();
    expect(screen.getByText('CVV inválido')).toBeInTheDocument();
    expect(screen.getByText('Nome obrigatório')).toBeInTheDocument();
  });

  it('should clear CVV and preserve other fields when clearCvvOnError flips to true', () => {
    const onChange = vi.fn();
    const filled = {
      number: '4000000000000010',
      holderName: 'JOAO',
      expiry: '1230',
      cvv: '123',
    };
    const { rerender } = render(
      <CardForm value={filled} onChange={onChange} clearCvvOnError={false} />,
    );
    onChange.mockClear();

    act(() => {
      rerender(<CardForm value={filled} onChange={onChange} clearCvvOnError={true} />);
    });

    expect(onChange).toHaveBeenCalledWith('cvv', '');
    // Apenas o CVV foi sinalizado para reset; nenhum outro campo é tocado.
    const fields = onChange.mock.calls.map((call) => call[0]);
    expect(fields).toEqual(['cvv']);
  });

  it('should disable all inputs when disabled=true', () => {
    setup({ disabled: true });
    expect(screen.getByLabelText('Número do cartão')).toBeDisabled();
    expect(screen.getByLabelText('Nome impresso no cartão')).toBeDisabled();
    expect(screen.getByLabelText('Validade')).toBeDisabled();
    expect(screen.getByLabelText('CVV')).toBeDisabled();
  });
});
