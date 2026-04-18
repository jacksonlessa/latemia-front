import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContratarStepper } from './contratar-stepper';

const STEPS = ['Plano', 'Cadastro', 'Pets', 'Contrato', 'Pagamento'];

describe('ContratarStepper', () => {
  it('should render all step labels', () => {
    render(<ContratarStepper steps={STEPS} current={0} />);
    for (const label of STEPS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('should mark current step as active with aria-current="step"', () => {
    render(<ContratarStepper steps={STEPS} current={2} />);
    const items = screen.getAllByRole('listitem');
    expect(items[2]).toHaveAttribute('aria-current', 'step');
  });

  it('should not set aria-current on non-active steps', () => {
    render(<ContratarStepper steps={STEPS} current={1} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });

  it('should mark completed steps visually when current > index', () => {
    render(<ContratarStepper steps={STEPS} current={2} />);
    // Steps 0 and 1 are completed (index < current=2), so they render Check icons
    // The Check icon has aria-hidden="true"; completed steps have no visible number
    const stepNumbers = screen.queryAllByText('1');
    // Step 1 (index=0) should not render its number (replaced by Check icon)
    expect(stepNumbers).toHaveLength(0);
  });

  it('should display step numbers for pending steps', () => {
    render(<ContratarStepper steps={STEPS} current={0} />);
    // Steps 1..5 are pending — their numbers should appear
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
