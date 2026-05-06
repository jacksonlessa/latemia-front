import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TerminalStateBanner } from './TerminalStateBanner';

describe('TerminalStateBanner', () => {
  it('should render "Plano encerrado: Cancelado" heading when status is cancelado', () => {
    render(<TerminalStateBanner status="cancelado" />);
    expect(
      screen.getByText(/Plano encerrado: Cancelado/i),
    ).toBeInTheDocument();
  });

  it('should render refund reason when status is estornado', () => {
    render(<TerminalStateBanner status="estornado" />);
    expect(screen.getByText(/refund total/i)).toBeInTheDocument();
  });

  it('should render chargeback reason when status is contestado', () => {
    render(<TerminalStateBanner status="contestado" />);
    expect(screen.getByText(/chargeback/i)).toBeInTheDocument();
  });

  it('should render alert role for assistive tech when status is terminal', () => {
    render(<TerminalStateBanner status="cancelado" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render nothing when status is not terminal', () => {
    // Type-cast: component receives PlanStatus but is defensive against
    // accidentally being called with non-terminal values.
    const { container } = render(
      <TerminalStateBanner status={'ativo' as never} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
