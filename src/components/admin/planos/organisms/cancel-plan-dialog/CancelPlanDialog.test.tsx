/**
 * Behaviour tests for CancelPlanDialog.
 *
 * Focuses on the double-confirmation gating rule:
 * - Confirm button is disabled until reason.length >= 10 AND checkbox is checked.
 * - Confirm button becomes enabled only when both conditions are met.
 *
 * Network calls are mocked via vi.stubGlobal('fetch').
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CancelPlanDialog } from './CancelPlanDialog';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Default props
// ---------------------------------------------------------------------------

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  planId: 'plan-uuid-test',
  onSuccess: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests — button state
// ---------------------------------------------------------------------------

describe('CancelPlanDialog — confirm button gating', () => {
  it('should render the confirm button disabled when dialog first opens', () => {
    render(<CancelPlanDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /cancelar plano/i });
    expect(confirmButton).toBeDisabled();
  });

  it('should keep confirm button disabled when reason has fewer than 10 characters', () => {
    render(<CancelPlanDialog {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'curto' } });

    const confirmButton = screen.getByRole('button', { name: /cancelar plano/i });
    expect(confirmButton).toBeDisabled();
  });

  it('should keep confirm button disabled when reason is valid but checkbox is unchecked', () => {
    render(<CancelPlanDialog {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Motivo com mais de dez caracteres.' },
    });

    const confirmButton = screen.getByRole('button', { name: /cancelar plano/i });
    expect(confirmButton).toBeDisabled();
  });

  it('should keep confirm button disabled when checkbox is checked but reason is too short', () => {
    render(<CancelPlanDialog {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const confirmButton = screen.getByRole('button', { name: /cancelar plano/i });
    expect(confirmButton).toBeDisabled();
  });

  it('should enable confirm button when reason >= 10 chars AND checkbox is checked', () => {
    render(<CancelPlanDialog {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Motivo com mais de dez caracteres.' },
    });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const confirmButton = screen.getByRole('button', { name: /cancelar plano/i });
    expect(confirmButton).not.toBeDisabled();
  });

  it('should disable confirm button again if reason is cleared after enabling', () => {
    render(<CancelPlanDialog {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Motivo com mais de dez caracteres.' },
    });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Clear the reason
    fireEvent.change(textarea, { target: { value: '' } });

    const confirmButton = screen.getByRole('button', { name: /cancelar plano/i });
    expect(confirmButton).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Tests — submission and error display
// ---------------------------------------------------------------------------

describe('CancelPlanDialog — network error display', () => {
  it('should display 503 error message when provider is unavailable', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () =>
        Promise.resolve({
          code: 'PAYMENT_PROVIDER_UNAVAILABLE',
          message: 'Pagar.me timeout.',
        }),
    } as unknown as Response);

    render(<CancelPlanDialog {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Motivo com mais de dez caracteres.' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    const confirmButton = screen.getByRole('button', { name: /cancelar plano/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Provedor de pagamento indisponível, tente novamente em instantes/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('should display 409 error message when plan is already cancelled', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () =>
        Promise.resolve({
          code: 'PLAN_ALREADY_CANCELLED',
          message: 'Plano já cancelado.',
        }),
    } as unknown as Response);

    render(<CancelPlanDialog {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Motivo com mais de dez caracteres.' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    const confirmButton = screen.getByRole('button', { name: /cancelar plano/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Este plano já foi cancelado/i),
      ).toBeInTheDocument();
    });
  });

  it('should call onSuccess when cancellation succeeds', async () => {
    const onSuccess = vi.fn();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          coveredUntil: '2026-06-30T23:59:59.000Z',
          cancellationId: 'cancel-id-001',
        }),
    } as unknown as Response);

    render(
      <CancelPlanDialog {...defaultProps} onSuccess={onSuccess} />,
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Motivo com mais de dez caracteres.' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /cancelar plano/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });
});

// ---------------------------------------------------------------------------
// Tests — character counter hint
// ---------------------------------------------------------------------------

describe('CancelPlanDialog — character counter', () => {
  it('should show minimum length hint when reason is non-empty but too short', () => {
    render(<CancelPlanDialog {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'abc' } });

    expect(screen.getByText(/mínimo 10 caracteres/i)).toBeInTheDocument();
  });

  it('should not show minimum length hint when reason meets the minimum', () => {
    render(<CancelPlanDialog {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: 'Motivo válido.' },
    });

    expect(screen.queryByText(/mínimo 10 caracteres/i)).not.toBeInTheDocument();
  });
});
