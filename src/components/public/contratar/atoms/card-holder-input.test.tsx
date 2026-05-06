import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardHolderInput } from './card-holder-input';

describe('CardHolderInput', () => {
  it('should render with cc-name autocomplete', () => {
    render(<CardHolderInput value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Nome impresso no cartão');
    expect(input).toHaveAttribute('autocomplete', 'cc-name');
  });

  it('should propagate uppercase value when uppercase=true (default)', () => {
    const onChange = vi.fn();
    render(<CardHolderInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Nome impresso no cartão'), {
      target: { value: 'joao silva' },
    });
    expect(onChange).toHaveBeenCalledWith('JOAO SILVA');
  });

  it('should preserve case when uppercase=false', () => {
    const onChange = vi.fn();
    render(<CardHolderInput value="" onChange={onChange} uppercase={false} />);
    fireEvent.change(screen.getByLabelText('Nome impresso no cartão'), {
      target: { value: 'Joao Silva' },
    });
    expect(onChange).toHaveBeenCalledWith('Joao Silva');
  });

  it('should expose error via aria-invalid and message', () => {
    render(<CardHolderInput value="" onChange={() => {}} error="Nome obrigatório" />);
    expect(screen.getByLabelText('Nome impresso no cartão')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Nome obrigatório')).toBeInTheDocument();
  });
});
