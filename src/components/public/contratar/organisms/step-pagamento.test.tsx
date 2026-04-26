import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepPagamento, type StepPagamentoProps } from './step-pagamento';
import type { CheckoutSummary } from '@/domain/checkout/checkout.types';

const summary: CheckoutSummary = {
  clientName: 'Maria',
  pets: [{ name: 'Rex', species: 'canino' }],
  pricePerPetCents: 4990,
  totalCents: 4990,
};

function setup(overrides: Partial<StepPagamentoProps> = {}) {
  const onSubmit = vi.fn();
  const onBack = vi.fn();
  const onRetry = vi.fn();
  const props: StepPagamentoProps = {
    summary,
    onSubmit,
    onBack,
    onRetry,
    ...overrides,
  };
  const utils = render(<StepPagamento {...props} />);
  return { ...utils, onSubmit, onBack, onRetry, props };
}

describe('StepPagamento — form mode', () => {
  it('should render the CardForm and the Concluir button by default', () => {
    setup();
    expect(screen.getByLabelText('Número do cartão')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /concluir/i })).toBeInTheDocument();
  });

  it('should disable the Concluir button immediately on click (RF6)', () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText('Número do cartão'), {
      target: { value: '4000 0000 0000 0010' },
    });
    fireEvent.change(screen.getByLabelText('Nome impresso no cartão'), {
      target: { value: 'Maria' },
    });
    fireEvent.change(screen.getByLabelText('Validade'), {
      target: { value: '12/30' },
    });
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });

    const button = screen.getByRole('button', { name: /concluir/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should not call onSubmit twice on rapid double click', () => {
    const { onSubmit } = setup();
    const button = screen.getByRole('button', { name: /concluir/i });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('StepPagamento — processing mode', () => {
  it('should hide the CardForm and render the progress panel', () => {
    setup({ mode: 'processing', currentStage: 5 });
    expect(screen.queryByLabelText('Número do cartão')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /concluir/i })).not.toBeInTheDocument();
    expect(screen.getByText(/conectando ao provedor/i)).toBeInTheDocument();
  });
});

describe('StepPagamento — error mode', () => {
  it('should render the progress panel with the failed stage and a retry button', () => {
    const { onRetry } = setup({
      mode: 'error',
      currentStage: 6,
      errorStage: 6,
      errorMessage: 'Seu cartão foi recusado.',
    });
    expect(screen.getByText('Seu cartão foi recusado.')).toBeInTheDocument();
    const retry = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retry).toBeInTheDocument();
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should re-enable the Concluir button when mode goes back to form', () => {
    const { rerender, props } = setup({ mode: 'processing' });
    rerender(<StepPagamento {...props} mode="form" />);
    const button = screen.getByRole('button', { name: /concluir/i });
    expect(button).not.toBeDisabled();
  });
});
