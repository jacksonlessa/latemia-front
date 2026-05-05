'use client';

/**
 * PublicCancelPlanForm
 *
 * Client Component organism that renders the cancellation confirmation
 * form for the public self-service flow.
 *
 * Requires:
 * - `preview` — masked plan data returned by the preview endpoint
 * - `token`   — single-use token (never logged in full)
 *
 * States:
 *   idle       — shows preview + form
 *   submitting — button disabled, spinner shown
 *   error      — inline error message; form remains active
 *   success    — replaced by CancellationSuccess
 *
 * Validation rules (mirrors admin CancelPlanDialog):
 *   - `reason` must be at least 10 characters
 *   - `aware` checkbox must be checked
 *
 * LGPD: only masked client/pet names are displayed; no CPF, phone, or email.
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  cancelPlanWithTokenUseCase,
  TokenExpiredError,
  TokenUsedError,
  PaymentProviderUnavailableError,
} from '@/domain/plan/cancel-plan-with-token.use-case';
import type { CancelPlanPreview } from '@/domain/plan/preview-cancel-plan.use-case';
import { CancellationSuccess } from './CancellationSuccess';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; coveredUntil: string | null };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLAN_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  carencia: 'Em carência',
  ativo: 'Ativo',
  inadimplente: 'Inadimplente',
  cancelado: 'Cancelado',
  estornado: 'Estornado',
  contestado: 'Contestado',
};

function planStatusLabel(status: string): string {
  return PLAN_STATUS_LABELS[status] ?? status;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PublicCancelPlanFormProps {
  preview: CancelPlanPreview;
  token: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PublicCancelPlanForm({ preview, token }: PublicCancelPlanFormProps) {
  const [reason, setReason] = useState('');
  const [aware, setAware] = useState(false);
  const [formState, setFormState] = useState<FormState>({ kind: 'idle' });

  const isReasonValid = reason.trim().length >= 10;
  const canSubmit = isReasonValid && aware && formState.kind !== 'submitting';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!canSubmit) return;

    setFormState({ kind: 'submitting' });

    try {
      const result = await cancelPlanWithTokenUseCase({
        token,
        reason: reason.trim(),
      });
      setFormState({ kind: 'success', coveredUntil: result.coveredUntil });
    } catch (err) {
      let message =
        'Não foi possível processar o cancelamento. Tente novamente em instantes.';

      if (err instanceof TokenExpiredError) {
        message =
          'Este link expirou. Entre em contato com o atendimento para um novo link.';
      } else if (err instanceof TokenUsedError) {
        message =
          'Este link já foi utilizado. Se foi você, seu cancelamento já está registrado.';
      } else if (err instanceof PaymentProviderUnavailableError) {
        message = err.message;
      }

      setFormState({ kind: 'error', message });
    }
  }

  if (formState.kind === 'success') {
    return <CancellationSuccess coveredUntil={formState.coveredUntil} />;
  }

  const isSubmitting = formState.kind === 'submitting';
  const errorMessage =
    formState.kind === 'error' ? formState.message : undefined;

  return (
    <div className="space-y-6">
      {/* Plan preview card — LGPD: masked data only */}
      <div className="rounded-lg border border-border bg-white p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Dados do plano
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Titular</span>
            <span className="font-medium text-foreground">
              {preview.clientName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pet</span>
            <span className="font-medium text-foreground">{preview.petName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm text-foreground">
              {planStatusLabel(preview.planStatus)}
            </span>
          </div>
          {preview.coveredUntil && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Coberto até
              </span>
              <span className="text-sm font-semibold text-foreground">
                {formatDate(preview.coveredUntil)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Irreversibility warning */}
      <div
        className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 flex gap-3"
        role="alert"
      >
        <AlertTriangle
          size={20}
          className="text-destructive shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1 text-sm text-destructive">
          <p className="font-semibold">Atenção: cancelamento definitivo</p>
          <p>
            O cancelamento é irreversível. Uma vez confirmado, não é possível
            reativar este plano. Para voltar a ter cobertura no futuro, será
            necessário contratar um novo plano.
          </p>
          {preview.coveredUntil && (
            <p>
              Sua cobertura permanecerá ativa até{' '}
              <span className="font-semibold">
                {formatDate(preview.coveredUntil)}
              </span>
              .
            </p>
          )}
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4"
          role="alert"
        >
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      {/* Cancellation form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Reason field */}
        <div className="space-y-1.5">
          <label
            htmlFor="cancel-reason"
            className="block text-sm font-medium text-foreground"
          >
            Motivo do cancelamento{' '}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </label>
          <textarea
            id="cancel-reason"
            name="reason"
            rows={4}
            required
            minLength={10}
            maxLength={500}
            placeholder="Descreva o motivo pelo qual deseja cancelar o plano…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            aria-describedby="cancel-reason-hint"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          <p
            id="cancel-reason-hint"
            className={`text-xs ${
              reason.trim().length > 0 && !isReasonValid
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {reason.trim().length}/500 caracteres (mínimo 10)
          </p>
        </div>

        {/* Awareness checkbox */}
        <div className="flex items-start gap-3">
          <input
            id="cancel-aware"
            type="checkbox"
            checked={aware}
            onChange={(e) => setAware(e.target.checked)}
            disabled={isSubmitting}
            className="mt-0.5 h-4 w-4 rounded border-input accent-[#4E8C75] cursor-pointer disabled:cursor-not-allowed"
          />
          <label
            htmlFor="cancel-aware"
            className="text-sm text-foreground cursor-pointer"
          >
            Estou ciente de que o cancelamento é{' '}
            <span className="font-semibold">definitivo e irreversível</span> e
            que não terei direito a reembolso do período já pago.
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-md bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                aria-hidden="true"
              />
              Processando…
            </span>
          ) : (
            'Confirmar cancelamento'
          )}
        </button>
      </form>
    </div>
  );
}
