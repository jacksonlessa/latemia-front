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
});
