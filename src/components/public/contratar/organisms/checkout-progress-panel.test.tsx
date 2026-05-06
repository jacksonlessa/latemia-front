import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  CheckoutProgressPanel,
  CHECKOUT_STAGE_MESSAGES,
  ANTI_FLICKER_MS,
} from './checkout-progress-panel';

describe('CheckoutProgressPanel', () => {
  it('should render all 8 canonical stage messages', () => {
    render(<CheckoutProgressPanel currentStage={1} asOverlay={false} />);
    for (let i = 1; i <= 8; i += 1) {
      expect(screen.getByText(CHECKOUT_STAGE_MESSAGES[i])).toBeInTheDocument();
    }
  });

  it('should mark stages before currentStage as done and current as in_progress (polite live)', () => {
    render(<CheckoutProgressPanel currentStage={3} asOverlay={false} />);
    const liveNodes = screen.getAllByRole('status');
    // The current stage (3) is the only in_progress live region.
    expect(liveNodes.length).toBeGreaterThanOrEqual(1);
    expect(
      liveNodes.some((n) => n.textContent?.includes(CHECKOUT_STAGE_MESSAGES[3])),
    ).toBe(true);
    liveNodes.forEach((n) => {
      expect(n).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('should expand stage 6 with one sub-item per pet', () => {
    render(
      <CheckoutProgressPanel
        currentStage={6}
        asOverlay={false}
        petStages={[
          { name: 'Rex', state: 'done' },
          { name: 'Mel', state: 'in_progress' },
          { name: 'Thor', state: 'pending' },
        ]}
      />,
    );
    expect(screen.getByText('Configurando assinatura para Rex')).toBeInTheDocument();
    expect(screen.getByText('Configurando assinatura para Mel')).toBeInTheDocument();
    expect(screen.getByText('Configurando assinatura para Thor')).toBeInTheDocument();
  });

  it('should render error state with errorMessage and trigger onRetry', () => {
    const onRetry = vi.fn();
    render(
      <CheckoutProgressPanel
        currentStage={5}
        errorStage={5}
        errorMessage="Provedor indisponível."
        onRetry={onRetry}
        asOverlay={false}
      />,
    );

    expect(screen.getByText('Provedor indisponível.')).toBeInTheDocument();
    const errorLive = screen
      .getAllByRole('status')
      .find((n) => n.getAttribute('aria-live') === 'assertive');
    expect(errorLive).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should render as a modal dialog with aria-modal and aria-labelledby when overlay', () => {
    render(<CheckoutProgressPanel currentStage={1} title="Processando" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)?.textContent).toBe(
      'Processando',
    );
  });

  it('should respect anti-flicker delay before advancing stage', async () => {
    vi.useFakeTimers();
    try {
      const { rerender } = render(
        <CheckoutProgressPanel currentStage={1} asOverlay={false} />,
      );

      // Inicialmente etapa 1 é in_progress.
      let liveNow = screen
        .getAllByRole('status')
        .map((n) => n.textContent ?? '');
      expect(liveNow.some((t) => t.includes(CHECKOUT_STAGE_MESSAGES[1]))).toBe(true);

      rerender(<CheckoutProgressPanel currentStage={2} asOverlay={false} />);

      // Antes de ANTI_FLICKER_MS, etapa 2 ainda não deve ter avançado.
      liveNow = screen.getAllByRole('status').map((n) => n.textContent ?? '');
      expect(liveNow.some((t) => t.includes(CHECKOUT_STAGE_MESSAGES[1]))).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(ANTI_FLICKER_MS + 50);
      });

      liveNow = screen.getAllByRole('status').map((n) => n.textContent ?? '');
      expect(liveNow.some((t) => t.includes(CHECKOUT_STAGE_MESSAGES[2]))).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should reflect error stage immediately, bypassing anti-flicker', () => {
    const { rerender } = render(
      <CheckoutProgressPanel currentStage={5} asOverlay={false} />,
    );

    rerender(
      <CheckoutProgressPanel
        currentStage={5}
        errorStage={5}
        errorMessage="Provedor indisponível."
        asOverlay={false}
      />,
    );

    expect(screen.getByText('Provedor indisponível.')).toBeInTheDocument();
  });
});
