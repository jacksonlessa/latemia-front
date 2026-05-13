import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepContrato } from './step-contrato';

describe('StepContrato', () => {
  const baseProps = {
    accepted: false,
    onAcceptedChange: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
  };

  it('should disable Avançar button when contract not accepted', () => {
    render(<StepContrato {...baseProps} accepted={false} />);
    const avancarButton = screen.getByRole('button', { name: 'Avançar' });
    expect(avancarButton).toBeDisabled();
  });

  it('should enable Avançar button when contract is accepted', () => {
    render(<StepContrato {...baseProps} accepted={true} />);
    const avancarButton = screen.getByRole('button', { name: 'Avançar' });
    expect(avancarButton).not.toBeDisabled();
  });

  it('should call onAcceptedChange with true when checkbox is checked', () => {
    const onAcceptedChange = vi.fn();
    render(<StepContrato {...baseProps} accepted={false} onAcceptedChange={onAcceptedChange} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onAcceptedChange).toHaveBeenCalledWith(true);
  });

  it('should call onNext when Avançar button is clicked and contract is accepted', () => {
    const onNext = vi.fn();
    render(<StepContrato {...baseProps} accepted={true} onNext={onNext} />);
    const avancarButton = screen.getByRole('button', { name: 'Avançar' });
    fireEvent.click(avancarButton);
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('should call onBack when Voltar button is clicked', () => {
    const onBack = vi.fn();
    render(<StepContrato {...baseProps} onBack={onBack} />);
    const voltarButton = screen.getByRole('button', { name: 'Voltar' });
    fireEvent.click(voltarButton);
    expect(onBack).toHaveBeenCalledOnce();
  });

  // Task 9.0 — `otpEnabled` is declared and propagated but not yet consumed.
  // These tests pin the current behaviour so Task 10.0 can detect intentional
  // changes when the overlay is wired in.
  it('should render unchanged when otpEnabled is omitted (default false)', () => {
    render(<StepContrato {...baseProps} accepted={true} />);
    expect(screen.getByRole('button', { name: 'Avançar' })).not.toBeDisabled();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should accept otpEnabled prop without altering current rendering (Task 10.0 wires the overlay)', () => {
    render(<StepContrato {...baseProps} accepted={true} otpEnabled={true} />);
    expect(screen.getByRole('button', { name: 'Avançar' })).not.toBeDisabled();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});
