/**
 * Tests for ContractOtpPanel organism.
 *
 * Validates the accessibility and UX contract that the OTP overlay must
 * satisfy regardless of the backend integration (which lives in the
 * parent StepContrato):
 *
 *  - Auto-focus on mount
 *  - 6-digit numeric-only input (non-digit characters stripped)
 *  - Paste of 6 digits triggers auto-submit
 *  - Cooldown counter disables the resend button until it reaches 0
 *  - Error messages render with `role="alert"`, input flips `aria-invalid`
 *  - Digits are NOT zeroed on error (UX rule from the PRD)
 *  - `busy` disables both controls
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContractOtpPanel } from './contract-otp-panel';

function noopSubmit(): Promise<void> {
  return Promise.resolve();
}

function noopResend(): Promise<void> {
  return Promise.resolve();
}

describe('ContractOtpPanel', () => {
  it('should auto-focus the OTP input on mount', () => {
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={noopSubmit}
        onResend={noopResend}
      />,
    );
    const input = screen.getByLabelText('Código de 6 dígitos');
    expect(input).toBe(document.activeElement);
  });

  it('should display the masked phone in the header', () => {
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={noopSubmit}
        onResend={noopResend}
      />,
    );
    expect(screen.getByText('(11) 9****-4321')).toBeInTheDocument();
  });

  it('should strip non-digit characters from the input', () => {
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={noopSubmit}
        onResend={noopResend}
      />,
    );
    const input = screen.getByLabelText('Código de 6 dígitos') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12a3b4' } });
    expect(input.value).toBe('1234');
  });

  it('should auto-submit when the input reaches 6 digits', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={onSubmit}
        onResend={noopResend}
      />,
    );
    const input = screen.getByLabelText('Código de 6 dígitos') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '123456' } });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
    expect(onSubmit).toHaveBeenCalledWith('123456');
  });

  it('should preserve digits typed when an error is rendered (do NOT zero the input)', () => {
    const { rerender } = render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={noopSubmit}
        onResend={noopResend}
      />,
    );
    const input = screen.getByLabelText('Código de 6 dígitos') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12345' } });

    rerender(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={noopSubmit}
        onResend={noopResend}
        errorMessage="Código incorreto. Verifique e tente novamente."
      />,
    );

    expect(input.value).toBe('12345');
  });

  it('should render error with role="alert" and mark input aria-invalid', () => {
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={noopSubmit}
        onResend={noopResend}
        errorMessage="Código incorreto. Verifique e tente novamente."
      />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Código incorreto');

    const input = screen.getByLabelText('Código de 6 dígitos');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('should disable the resend button while cooldownSeconds > 0', () => {
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={45}
        onSubmit={noopSubmit}
        onResend={noopResend}
      />,
    );
    const button = screen.getByRole('button', { name: /reenviar/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('45s');
  });

  it('should enable the resend button when cooldownSeconds reaches 0', () => {
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={0}
        onSubmit={noopSubmit}
        onResend={noopResend}
      />,
    );
    const button = screen.getByRole('button', { name: 'Reenviar código' });
    expect(button).not.toBeDisabled();
  });

  it('should invoke onResend when the resend button is clicked after cooldown', async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={0}
        onSubmit={noopSubmit}
        onResend={onResend}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reenviar código' }));
    await waitFor(() => {
      expect(onResend).toHaveBeenCalledOnce();
    });
  });

  it('should disable both controls when busy=true', () => {
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={0}
        onSubmit={noopSubmit}
        onResend={noopResend}
        busy
      />,
    );
    const input = screen.getByLabelText('Código de 6 dígitos');
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: /reenviar/i })).toBeDisabled();
  });

  it('should expose inputMode="numeric" and autoComplete="one-time-code" on the input', () => {
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={noopSubmit}
        onResend={noopResend}
      />,
    );
    const input = screen.getByLabelText('Código de 6 dígitos');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('autocomplete')).toBe('one-time-code');
  });

  it('should fill the input on paste of 6 digits and auto-submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={onSubmit}
        onResend={noopResend}
      />,
    );
    const input = screen.getByLabelText('Código de 6 dígitos') as HTMLInputElement;

    fireEvent.paste(input, {
      clipboardData: {
        getData: (type: string) => (type === 'text' ? '123 456' : ''),
      },
    });

    await waitFor(() => {
      expect(input.value).toBe('123456');
    });
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });

  it('should not auto-submit twice for the same code value', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ContractOtpPanel
        phoneMasked="(11) 9****-4321"
        cooldownSeconds={60}
        onSubmit={onSubmit}
        onResend={noopResend}
      />,
    );
    const input = screen.getByLabelText('Código de 6 dígitos') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });
});
