import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressSubStep } from './progress-sub-step';

function renderInList(ui: React.ReactNode) {
  return render(<ul>{ui}</ul>);
}

describe('ProgressSubStep', () => {
  it('should render label in pending state without role=status', () => {
    renderInList(<ProgressSubStep state="pending" label="Configurando assinatura para Rex" />);
    expect(screen.getByText('Configurando assinatura para Rex')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('should render polite live region when in_progress', () => {
    renderInList(
      <ProgressSubStep state="in_progress" label="Configurando assinatura para Rex" />,
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('should render assertive live region with error message when error', () => {
    renderInList(
      <ProgressSubStep
        state="error"
        label="Configurando assinatura para Rex"
        errorMessage="Cartão recusado."
      />,
    );
    const live = screen.getByRole('status');
    expect(live).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('Cartão recusado.')).toBeInTheDocument();
  });

  it('should render done state without aria-live', () => {
    renderInList(<ProgressSubStep state="done" label="Configurando assinatura para Rex" />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Configurando assinatura para Rex')).toBeInTheDocument();
  });
});
