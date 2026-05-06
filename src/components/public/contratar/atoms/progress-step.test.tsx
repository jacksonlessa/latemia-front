import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressStep } from './progress-step';

function renderInList(ui: React.ReactNode) {
  return render(<ul>{ui}</ul>);
}

describe('ProgressStep', () => {
  it('should render label in pending state without role=status', () => {
    renderInList(<ProgressStep state="pending" label="Validando dados do cartão..." />);
    expect(screen.getByText('Validando dados do cartão...')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('should render polite live region when in_progress', () => {
    renderInList(
      <ProgressStep state="in_progress" label="Tokenizando seu cartão com segurança..." />,
    );
    const live = screen.getByRole('status');
    expect(live).toHaveAttribute('aria-live', 'polite');
  });

  it('should render assertive live region with error message when error', () => {
    renderInList(
      <ProgressStep
        state="error"
        label="Conectando ao provedor de pagamento..."
        errorMessage="Provedor indisponível."
      />,
    );
    const live = screen.getByRole('status');
    expect(live).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('Provedor indisponível.')).toBeInTheDocument();
  });

  it('should render done state without aria-live', () => {
    renderInList(<ProgressStep state="done" label="Salvando seus dados de cadastro..." />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Salvando seus dados de cadastro...')).toBeInTheDocument();
  });

  it('should render sub-steps when provided', () => {
    renderInList(
      <ProgressStep
        state="in_progress"
        label="Configurando assinaturas..."
        subSteps={[
          { id: 'a', label: 'Configurando assinatura para Rex', state: 'done' },
          { id: 'b', label: 'Configurando assinatura para Mel', state: 'in_progress' },
          { id: 'c', label: 'Configurando assinatura para Thor', state: 'pending' },
        ]}
      />,
    );
    expect(screen.getByText('Configurando assinatura para Rex')).toBeInTheDocument();
    expect(screen.getByText('Configurando assinatura para Mel')).toBeInTheDocument();
    expect(screen.getByText('Configurando assinatura para Thor')).toBeInTheDocument();
  });
});
