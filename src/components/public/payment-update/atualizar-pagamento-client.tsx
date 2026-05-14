'use client';

/**
 * AtualizarPagamentoClient
 *
 * Client Component that orchestrates the 6-state machine for the public
 * payment-update flow:
 *
 *   loading    — validating token on mount
 *   invalid    — token invalid/expired/used
 *   form       — shows tutorMaskedName, petsCovered and card form
 *   submitting — card is being tokenized and submitted
 *   error      — gateway error OR `charge_failed` outcome; form remains
 *                active for retry, token stays alive on the backend
 *   success    — card updated; renders success message based on chargesBehavior
 *
 * LGPD: displays only tutorMaskedName and petsCovered — no CPF, phone, or email.
 * PCI:  card data (PAN, CVV) never leave the PaymentCardForm component;
 *       only the Pagar.me token is forwarded to the backend.
 *
 * Model: 1 customer = 1 subscription with N items (pivô subscription consolidada).
 * A single card update regularizes all covered pets at once.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentCardForm } from './molecules/payment-card-form';
import { PaymentUpdateInvalid } from './organisms/payment-update-invalid';
import {
  validatePaymentUpdateToken,
  TokenInvalidError,
} from '@/domain/payment-update/validate-payment-update-token.use-case';
import {
  consumePaymentUpdateToken,
  ConsumePaymentError,
} from '@/domain/payment-update/consume-payment-update-token.use-case';
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
  | { kind: 'success'; chargesBehavior: TokenContext['chargesBehavior'] };

// ---------------------------------------------------------------------------
// Success messages — derived from chargesBehavior (aggregated across all pets)
// ---------------------------------------------------------------------------

const SUCCESS_MESSAGES: Record<TokenContext['chargesBehavior'], string> = {
  immediate:
    'Pronto! Atualizamos o cartão e já estamos processando a cobrança em atraso de todos os seus pets.',
  next_cycle:
    'Pronto! O novo cartão será usado na próxima cobrança mensal.',
};

const FAILED_CHARGE_FALLBACK = 'Cartão recusado. Tente outro cartão.';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPetsCoveredLabel(petsCovered: string[]): string {
  if (petsCovered.length === 1) {
    return `Pet coberto: ${petsCovered[0]}`;
  }
  return `Pets cobertos: ${petsCovered.join(', ')}`;
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

      // `charge_failed` is NOT a success state — keep the form alive so the
      // customer can try another card. Token remains active on the backend.
      if (result.outcome === 'charge_failed') {
        setState({
          kind: 'error',
          context,
          message: result.failureMessage ?? FAILED_CHARGE_FALLBACK,
        });
        return;
      }

      setState({ kind: 'success', chargesBehavior: context.chargesBehavior });
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
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <div className="space-y-2">
          <h2 className="font-display text-2xl text-forest">Cartão atualizado!</h2>
          <p className="text-base text-foreground max-w-sm mx-auto">
            {SUCCESS_MESSAGES[state.chargesBehavior]}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4 max-w-sm w-full text-sm text-muted-foreground">
          Em caso de dúvidas, entre em contato com nossa equipe pelo WhatsApp.
        </div>
      </div>
    );
  }

  // form | submitting | error
  const context = state.context;
  const isSubmitting = state.kind === 'submitting';
  const errorMessage = state.kind === 'error' ? state.message : undefined;

  return (
    <div className="space-y-6">
      {/* Tutor + pets context — LGPD: no CPF, phone, email */}
      <header className="rounded-lg border border-border bg-white p-4 space-y-3">
        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Titular do plano
          </h2>
          <p className="font-medium text-foreground">{context.tutorMaskedName}</p>
        </div>

        <section aria-label="Pets cobertos">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {context.petsCovered.length === 1 ? 'Pet coberto' : 'Pets cobertos'}
          </p>
          <p className="text-sm text-foreground">
            {buildPetsCoveredLabel(context.petsCovered)}
          </p>
        </section>
      </header>

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
        Pagar.me — nunca passam pelos servidores do Dr. Cleitinho.
      </p>
    </div>
  );
}
