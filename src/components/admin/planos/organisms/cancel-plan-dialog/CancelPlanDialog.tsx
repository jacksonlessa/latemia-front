'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Copy, Link2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  cancelPlanUseCase,
  PlanAlreadyCancelledError,
  PaymentProviderUnavailableError,
} from '@/domain/plan/cancel-plan.use-case';
import { generateCancellationTokenUseCase } from '@/domain/plan/generate-cancellation-token.use-case';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CancelPlanDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog requests open state change (close on cancel/ESC). */
  onOpenChange: (open: boolean) => void;
  /** UUID of the plan to cancel. */
  planId: string;
  /**
   * ISO string for the covered-until date shown in the description (if known
   * in advance). When omitted the description uses a generic phrase.
   */
  coveredUntil?: string | null;
  /** Called when the cancellation succeeds. */
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
});

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : shortDateFormatter.format(d);
}

function userFriendlyError(err: unknown): string {
  if (err instanceof PaymentProviderUnavailableError) {
    return 'Provedor de pagamento indisponível, tente novamente em instantes.';
  }
  if (err instanceof PlanAlreadyCancelledError) {
    return 'Este plano já foi cancelado.';
  }
  if (err instanceof Error) {
    return err.message || 'Ocorreu um erro inesperado. Tente novamente.';
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Organism — `CancelPlanDialog`.
 *
 * Wraps the shadcn `AlertDialog` and implements the double-confirmation
 * pattern for plan cancellation:
 * 1. Operator fills in a reason (min 10 chars, max 500 chars).
 * 2. Operator checks the acknowledgement checkbox.
 * 3. Confirm button becomes enabled; on click it calls `cancelPlanUseCase`.
 *
 * States: idle → submitting → error (inline message) / success (calls onSuccess).
 *
 * LGPD: reason text is not logged at this layer; only `planId` + status codes.
 */
export function CancelPlanDialog({
  open,
  onOpenChange,
  planId,
  coveredUntil,
  onSuccess,
}: CancelPlanDialogProps) {
  const [reason, setReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Token link generation state
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset internal state each time the dialog opens.
  useEffect(() => {
    if (open) {
      setReason('');
      setAcknowledged(false);
      setSubmitting(false);
      setErrorMessage(null);
      setGeneratingLink(false);
      setGeneratedLink(null);
      setLinkError(null);
      setCopied(false);
      // Auto-focus the textarea for keyboard users.
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  const canSubmit =
    reason.length >= MIN_REASON_LENGTH && acknowledged && !submitting;

  const formattedCoveredUntil = formatDate(coveredUntil);

  async function handleGenerateLink() {
    setGeneratingLink(true);
    setLinkError(null);
    setGeneratedLink(null);
    setCopied(false);
    try {
      const { url } = await generateCancellationTokenUseCase(planId);
      setGeneratedLink(url);
    } catch {
      setLinkError('Não foi possível gerar o link. Tente novamente.');
    } finally {
      setGeneratingLink(false);
    }
  }

  async function handleCopy() {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleConfirm() {
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await cancelPlanUseCase({ planId, reason });
      // Close dialog BEFORE calling onSuccess so the parent's router.refresh()
      // re-renders a clean state.
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setErrorMessage(userFriendlyError(err));

      // For 409 (already cancelled) close the dialog after showing the message
      // briefly — the parent's router.refresh() will update the UI to reflect
      // the terminal status.
      if (err instanceof PlanAlreadyCancelledError) {
        setTimeout(() => {
          onOpenChange(false);
          onSuccess();
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Block close while submitting to prevent orphaned requests.
        if (!next && submitting) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            Cancelar plano?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Esta ação é <strong className="text-destructive">irreversível</strong>.
                O cliente não poderá reativar este plano — para continuar precisará
                contratar um novo plano.
              </p>
              {formattedCoveredUntil ? (
                <p>
                  A cobertura permanece ativa até{' '}
                  <strong>{formattedCoveredUntil}</strong>.
                </p>
              ) : (
                <p>
                  A cobertura permanece ativa até o final do ciclo já pago.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Body */}
        <div className="flex flex-col gap-4 py-2">
          {/* Reason field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cancel-reason"
              className="text-sm font-medium text-foreground"
            >
              Motivo do cancelamento{' '}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </label>
            <textarea
              id="cancel-reason"
              ref={textareaRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={MAX_REASON_LENGTH}
              rows={4}
              disabled={submitting}
              aria-required="true"
              aria-describedby="cancel-reason-hint"
              placeholder="Descreva o motivo do cancelamento (mínimo 10 caracteres)…"
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p
              id="cancel-reason-hint"
              className="text-xs text-muted-foreground text-right"
              aria-live="polite"
            >
              {reason.length}/{MAX_REASON_LENGTH}
              {reason.length > 0 && reason.length < MIN_REASON_LENGTH
                ? ` — mínimo ${MIN_REASON_LENGTH} caracteres`
                : ''}
            </p>
          </div>

          {/* Acknowledgement checkbox */}
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={submitting}
              aria-label="Estou ciente de que esta ação é irreversível"
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-destructive disabled:cursor-not-allowed"
            />
            <span className="text-sm text-foreground">
              Estou ciente de que esta ação é{' '}
              <strong>irreversível</strong> e que o plano não poderá ser
              reativado.
            </span>
          </label>

          {/* Inline error message */}
          {errorMessage ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          ) : null}

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex-1 border-t border-border" />
            <span>ou prefere que o cliente confirme?</span>
            <span className="flex-1 border-t border-border" />
          </div>

          {/* Token link section */}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={generatingLink || submitting}
              onClick={handleGenerateLink}
              className="w-full"
            >
              {generatingLink ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Gerando link…
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                  Gerar link de cancelamento para o cliente
                </>
              )}
            </Button>

            {linkError ? (
              <p role="alert" className="text-xs text-destructive">
                {linkError}
              </p>
            ) : null}

            {generatedLink ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                <span
                  className="flex-1 truncate text-xs text-foreground"
                  title={generatedLink}
                  data-testid="generated-link"
                >
                  {generatedLink}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  aria-label="Copiar link"
                  className="h-7 shrink-0 px-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="ml-1 text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Voltar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!canSubmit}
            onClick={handleConfirm}
          >
            {submitting ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Cancelando…
              </>
            ) : (
              'Cancelar plano'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
