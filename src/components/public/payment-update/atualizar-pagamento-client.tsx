'use client';

/**
 * AtualizarPagamentoClient
 *
 * Client Component that orchestrates the 6-state machine for the public
 * payment-update flow:
 *
 *   loading    — validating token on mount
 *   invalid    — token invalid/expired/used
 *   form       — shows petName, planStatus and card form
 *   submitting — card is being tokenized and submitted
 *   error      — gateway error; form remains active for retry
 *   success    — payment method updated
 *
 * LGPD: displays only petName and planStatus — no CPF, phone, or email.
 * PCI:  card data (PAN, CVV) never leave the PaymentCardForm component;
 *       only the Pagar.me token is forwarded to the backend.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentCardForm } from './molecules/payment-card-form';
import { PaymentUpdateSuccess } from './organisms/payment-update-success';
import { PaymentUpdateInvalid } from './organisms/payment-update-invalid';
import { validatePaymentUpdateToken, TokenInvalidError } from '@/domain/payment-update/validate-payment-update-token.use-case';
import { consumePaymentUpdateToken, ConsumePaymentError } from '@/domain/payment-update/consume-payment-update-token.use-case';
import type { TokenContext } from '@/domain/payment-update/types';

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

type PageState =
  | { kind: 'loading' }
  | { kind: 'invalid' }
  | { kind: 'form'; context: TokenContext }
  | { kind: 'submitting'; context: TokenContext }
  | { kind: 'error'; context: TokenContext; message: string }
  | { kind: 'success'; chargesBehavior: 'immediate' | 'next_cycle' };

// ---------------------------------------------------------------------------
// PT-BR plan status labels (LGPD — no personal data)
// ---------------------------------------------------------------------------

const STATUS_LABEL: Record<string, string> = {
  inadimplente: 'Inadimplente',
  ativo: 'Ativo',
  carencia: 'Em carência',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
};

function planStatusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AtualizarPagamentoClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [state, setState] = useState<PageState>({ kind: 'loading' });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setState({ kind: 'invalid' });
      return;
    }

    let cancelled = false;

    validatePaymentUpdateToken(token)
      .then((context) => {
        if (!cancelled) {
          setState({ kind: 'form', context });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof TokenInvalidError) {
          setState({ kind: 'invalid' });
        } else {
          // Network or unexpected error — also show invalid screen
          setState({ kind: 'invalid' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Card tokenized — submit to backend
  async function handleCardToken(cardToken: string): Promise<void> {
    if (state.kind !== 'form' && state.kind !== 'error') return;
    const context = state.context;

    setState({ kind: 'submitting', context });

    try {
      const result = await consumePaymentUpdateToken(token, cardToken);
      setState({
        kind: 'success',
        chargesBehavior: result.chargesBehavior,
      });
    } catch (err) {
      let message = 'Não foi possível atualizar o cartão. Tente novamente.';
      if (err instanceof TokenInvalidError) {
        setState({ kind: 'invalid' });
        return;
      }
      if (err instanceof ConsumePaymentError) {
        message = err.message;
      }
      setState({ kind: 'error', context, message });
    }
  }

  function handleCardError(message: string): void {
    // Error was already set inline by PaymentCardForm; propagate to state so
    // the error banner stays visible if re-renders occur.
    if (state.kind === 'form' || state.kind === 'error') {
      setState({ kind: 'error', context: state.context, message });
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (state.kind === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div
          className="h-10 w-10 rounded-full border-4 border-[#4E8C75] border-t-transparent animate-spin"
          aria-label="Carregando…"
          role="status"
        />
        <p className="text-sm text-muted-foreground">Verificando link…</p>
      </div>
    );
  }

  if (state.kind === 'invalid') {
    return <PaymentUpdateInvalid />;
  }

  if (state.kind === 'success') {
    return (
      <PaymentUpdateSuccess chargesBehavior={state.chargesBehavior} />
    );
  }

  // form | submitting | error
  const context = state.context;
  const isSubmitting = state.kind === 'submitting';
  const errorMessage = state.kind === 'error' ? state.message : undefined;

  return (
    <div className="space-y-6">
      {/* Plan context — LGPD: no CPF, phone, email */}
      <div className="rounded-lg border border-border bg-white p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Plano do pet
        </p>
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{context.petName}</span>
          <span className="text-sm text-muted-foreground">
            {planStatusLabel(context.planStatus)}
          </span>
        </div>
      </div>

      {/* Error banner — inline, form stays active */}
      {errorMessage && (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4"
          role="alert"
        >
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      {/* Card form */}
      <PaymentCardForm
        onSuccess={handleCardToken}
        onError={handleCardError}
        disabled={isSubmitting}
      />

      <p className="text-xs text-muted-foreground text-center">
        Seus dados de cartão são criptografados e processados diretamente pelo
        Pagar.me — nunca passam pelos servidores da Late &amp; Mia.
      </p>
    </div>
  );
}
