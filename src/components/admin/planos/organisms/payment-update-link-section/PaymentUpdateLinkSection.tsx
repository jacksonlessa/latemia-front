'use client';

import { useState } from 'react';
import { Check, Copy, Link2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  generatePaymentUpdateLinkUseCase,
  type GenerateTokenResponse,
  PlanIneligibleForPaymentUpdateError,
} from '@/domain/plan/generate-payment-update-link.use-case';
import type { PlanDetail } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentUpdateLinkSectionProps {
  planId: string;
  currentToken: PlanDetail['paymentUpdateToken'];
  onGenerated?: (token: GenerateTokenResponse) => void;
  /** Optional external isLoading override — used by Storybook to freeze the loading state. */
  isLoading?: boolean;
}

type TokenState = NonNullable<PlanDetail['paymentUpdateToken']>;

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDate(iso: string): string {
  try {
    return shortDateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface TokenBadgeProps {
  tokenState: TokenState;
}

function TokenBadge({ tokenState }: TokenBadgeProps) {
  if (tokenState.status === 'active') {
    return (
      <Badge className="border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]">
        Ativo até {formatDate(tokenState.expiresAt)}
      </Badge>
    );
  }

  if (tokenState.status === 'used') {
    return (
      <Badge className="border-transparent bg-amber-50 text-amber-600 hover:bg-amber-50">
        Utilizado em{' '}
        {tokenState.usedAt ? formatDate(tokenState.usedAt) : '—'}
      </Badge>
    );
  }

  // expired
  return (
    <Badge className="border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100">
      Expirado
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// CopyUrlButton
// ---------------------------------------------------------------------------

interface CopyUrlButtonProps {
  url: string;
}

function CopyUrlButton({ url }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard not available — silently no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs text-[#6B6B6E] hover:bg-gray-100 hover:text-[#4E8C75] transition-colors"
      aria-label={copied ? 'URL copiada!' : 'Copiar URL do link'}
      title={copied ? 'URL copiada!' : 'Copiar URL do link'}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[#4E8C75]" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PaymentUpdateLinkSection — Organism
// ---------------------------------------------------------------------------

/**
 * PaymentUpdateLinkSection — Organism
 *
 * Renders the payment-update link management section inside
 * `/admin/planos/[id]`. Should be rendered only when the plan status is one
 * of the eligible statuses (`ativo`, `carencia`, `pendente`, `inadimplente`)
 * — visibility is gated by the parent via
 * `canGeneratePaymentUpdateLink(plan.status)`. Hidden (no placeholder) for
 * terminal statuses (`cancelado`, `estornado`, `contestado`).
 *
 * States:
 * - `no-link`  (currentToken is null/undefined): shows "Gerar link" button only.
 * - `active`   : shows the shareable URL, a copy button, an "active until" badge,
 *                and a "Gerar novo link" button.
 * - `used`     : shows a "Used on <date>" badge and a "Gerar novo link" button.
 * - `expired`  : shows an "Expirado" badge and a "Gerar novo link" button.
 *
 * On generate: calls `generatePaymentUpdateLinkUseCase`, updates local state
 * without reloading the page, and calls `onGenerated` if provided.
 *
 * Defense-in-depth: a 422 from the backend (e.g. plan transitioned to a
 * terminal status between page render and click, or admin forced the
 * request via DevTools) surfaces an inline error message that does not
 * incorrectly state the plan must be `inadimplente`.
 */
export function PaymentUpdateLinkSection({
  planId,
  currentToken,
  onGenerated,
  isLoading: isLoadingProp,
}: PaymentUpdateLinkSectionProps) {
  // Local token state — starts from prop, updated optimistically after generation.
  const [tokenState, setTokenState] = useState<TokenState | null | undefined>(
    currentToken,
  );
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(() => {
    if (currentToken?.status === 'active') {
      return `${process.env.NEXT_PUBLIC_APP_URL}/atualizar-pagamento?token=${currentToken.token}`;
    }
    return null;
  });
  const [isLoadingInternal, setIsLoadingInternal] = useState(false);
  const isLoading = isLoadingProp ?? isLoadingInternal;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoadingInternal(true);
    setErrorMessage(null);

    try {
      const result = await generatePaymentUpdateLinkUseCase(planId);

      // Update local state to reflect new active token without a page reload.
      setTokenState({
        token: result.token,
        status: 'active',
        expiresAt: result.expiresAt,
        usedAt: null,
      });
      setGeneratedUrl(result.url);

      onGenerated?.(result);
    } catch (err) {
      if (err instanceof PlanIneligibleForPaymentUpdateError) {
        // Backend 422 — plan is in a terminal status (cancelado / estornado /
        // contestado). Surface a message aligned with the new eligibility rule
        // and avoid mentioning only "inadimplente".
        setErrorMessage(
          err.message ||
            'Este plano não está elegível para atualização de pagamento. O link não pode ser gerado.',
        );
      } else {
        setErrorMessage('Ocorreu um erro ao gerar o link. Tente novamente.');
      }
    } finally {
      setIsLoadingInternal(false);
    }
  }

  // Determine the URL to display: prefer newly generated URL (has full URL
  // from the response), otherwise we have no URL for non-active states.
  const displayUrl = generatedUrl;

  const hasToken = tokenState != null;
  const isActive = tokenState?.status === 'active';

  return (
    <section
      className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden"
      aria-label="Link de atualização de pagamento"
    >
      <header className="flex items-start justify-between gap-3 border-b border-amber-200 px-4 py-3 md:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#2C2C2E]">
            Atualização de Meio de Pagamento
          </h2>
          <p className="mt-0.5 text-xs text-[#6B6B6E]">
            Gere um link seguro para que o cliente atualize os dados do cartão
            sem precisar fazer login.
          </p>
        </div>
      </header>

      <div className="px-4 py-4 md:px-5 md:py-5 space-y-4">
        {/* Current token status */}
        {hasToken ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#6B6B6E] font-medium">
                Status do link:
              </span>
              <TokenBadge tokenState={tokenState} />
            </div>

            {/* Active: show URL + copy */}
            {isActive && displayUrl ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#4E8C75]/30 bg-white px-3 py-2">
                <Link2
                  className="h-4 w-4 flex-shrink-0 text-[#4E8C75]"
                  aria-hidden="true"
                />
                <span className="flex-1 min-w-0 break-all font-mono text-xs text-[#2C2C2E]">
                  {displayUrl}
                </span>
                <CopyUrlButton url={displayUrl} />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Error feedback */}
        {errorMessage ? (
          <p
            role="alert"
            className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >
            {errorMessage}
          </p>
        ) : null}

        {/* Generate button */}
        <Button
          type="button"
          variant={hasToken ? 'outline' : 'default'}
          size="sm"
          onClick={handleGenerate}
          disabled={isLoading}
          className={
            hasToken
              ? 'border-[#4E8C75] text-[#4E8C75] hover:bg-[#EAF4F0] hover:text-[#4E8C75]'
              : 'bg-[#4E8C75] text-white hover:bg-[#3d7260]'
          }
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw
                className="h-3.5 w-3.5 animate-spin"
                aria-hidden="true"
              />
              <span>Gerando...</span>
            </>
          ) : hasToken ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Gerar novo link</span>
            </>
          ) : (
            <span>Gerar link de atualização de pagamento</span>
          )}
        </Button>
      </div>
    </section>
  );
}
