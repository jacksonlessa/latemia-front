'use client';

/**
 * AtualizarPagamentoClient
 *
 * Client Component that orchestrates the 7-state machine for the public
 * payment-update flow:
 *
 *   loading    — validating token on mount
 *   invalid    — token invalid/expired/used
 *   exhausted  — `token_exhausted` outcome; link reached its failure limit,
 *                no form is rendered, customer is guided to the clinic
 *   form       — shows tutorMaskedName, petsCovered and card form
 *   submitting — card is being tokenized and submitted
 *   error      — gateway error OR `charge_failed` outcome; form remains
 *                active for retry, token stays alive on the backend (until
 *                the failure limit turns the next attempt into `exhausted`)
 *   success    — card updated; renders success message based on chargesBehavior
 *
 * The `error` state renders a title + detail pair. Both are forwarded as-is
 * from the backend (RF-4.1) — no translation or reformatting happens here.
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
import { PaymentUpdateExhausted } from './organisms/payment-update-exhausted';
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
  | { kind: 'exhausted' }
  | { kind: 'form'; context: TokenContext }
  | { kind: 'submitting'; context: TokenContext }
  | { kind: 'error'; context: TokenContext; title: string; detail: string }
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

const FAILED_CHARGE_TITLE = 'Não foi possível concluir a cobrança';
const FAILED_CHARGE_FALLBACK = 'Cartão recusado. Tente outro cartão.';
const GENERIC_ERROR_TITLE = 'Não foi possível atualizar o cartão';

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

      // `token_exhausted` — the link itself reached its failure limit.
      // No form: insisting on the same link is exactly what must stop.
      if (result.outcome === 'token_exhausted') {
        setState({ kind: 'exhausted' });
        return;
      }

      // `charge_failed` is NOT a success state — keep the form alive so the
      // customer can try another card. Token remains active on the backend
      // (until the failure limit is reached, which yields `token_exhausted`).
      // Title/detail are forwarded as-is from the backend (RF-4.1) — no
      // translation or reformatting happens on the frontend. Fallback chain:
      // failureDetail → failureMessage → generic text, so the screen keeps
      // working even if front/back momentarily disagree on the contract.
      if (result.outcome === 'charge_failed') {
        setState({
          kind: 'error',
          context,
          title: result.failureTitle ?? FAILED_CHARGE_TITLE,
          detail: result.failureDetail ?? result.failureMessage ?? FAILED_CHARGE_FALLBACK,
        });
        return;
      }

      setState({ kind: 'success', chargesBehavior: context.chargesBehavior });
    } catch (err) {
      let detail = 'Não foi possível atualizar o cartão. Tente novamente.';
      if (err instanceof TokenInvalidError) {
        setState({ kind: 'invalid' });
        return;
      }
      if (err instanceof ConsumePaymentError) {
        detail = err.message;
      }
      setState({ kind: 'error', context, title: GENERIC_ERROR_TITLE, detail });
    }
  }

  function handleCardError(message: string): void {
    // Error was already set inline by PaymentCardForm; propagate to state so
    // the error banner stays visible if re-renders occur. This is a
    // client-side tokenization failure (before hitting the backend), so it
    // uses the generic title rather than the backend's charge-failure title.
    if (state.kind === 'form' || state.kind === 'error') {
      setState({
        kind: 'error',
        context: state.context,
        title: GENERIC_ERROR_TITLE,
        detail: message,
      });
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

  if (state.kind === 'exhausted') {
    return <PaymentUpdateExhausted />;
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
  const errorTitle = state.kind === 'error' ? state.title : undefined;
  const errorDetail = state.kind === 'error' ? state.detail : undefined;

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

      {/* Error banner — inline, form stays active. Title in destaque, detail
          as secondary text. Both are forwarded as-is from the backend. */}
      {errorTitle && errorDetail && (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-1"
          role="alert"
        >
          <p className="text-sm font-semibold text-destructive">{errorTitle}</p>
          <p className="text-sm text-destructive/90">{errorDetail}</p>
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
        Pagar.me — nunca passam pelos servidores da Late&Mia Clínica Veterinária.
      </p>
    </div>
  );
}
