'use client';

import { useState } from 'react';
import { Check, Copy, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PlanStatusBadge } from '@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge';
import type { PlanDetail, PlanStatus } from '@/lib/types/plan';

interface PlanDetailHeaderProps {
  plan: PlanDetail;
  /**
   * Triggered when the user clicks the header "Registrar uso" button. The
   * parent decides what happens — typically switches to the Benefício tab
   * and opens the registration modal.
   */
  onRegisterUsageClick: () => void;
  /**
   * When provided, the "Cancelar plano" button becomes actionable and calls
   * this callback on click. When omitted the button remains disabled (e.g.
   * for plans in terminal status).
   */
  onCancelClick?: () => void;
}

const REGISTER_BLOCKED_STATUSES: ReadonlySet<PlanStatus> = new Set<PlanStatus>([
  'pendente',
  'cancelado',
]);

function blockedReason(status: PlanStatus): string | null {
  if (status === 'pendente') {
    return 'Não é possível registrar uso enquanto o plano está pendente.';
  }
  if (status === 'cancelado') {
    return 'Não é possível registrar uso em planos cancelados.';
  }
  return null;
}

export function PlanDetailHeader({
  plan,
  onRegisterUsageClick,
  onCancelClick,
}: PlanDetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const registerBlocked = REGISTER_BLOCKED_STATUSES.has(plan.status);
  const reason = blockedReason(plan.status);

  async function handleCopyId() {
    if (!plan.pagarmeSubscriptionId) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(plan.pagarmeSubscriptionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // silent — older browsers; user can copy manually from the section card.
    }
  }

  return (
    <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#2C2C2E] leading-tight">
            Detalhe do Plano
          </h1>
          <p className="mt-1 font-mono text-xs text-[#6B6B6E] break-all">
            ID: {plan.id}
          </p>
        </div>
        <div className="md:ml-3">
          <PlanStatusBadge status={plan.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {registerBlocked && reason ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    type="button"
                    size="sm"
                    disabled
                    aria-disabled="true"
                    aria-label="Registrar uso (indisponível)"
                  >
                    <Plus aria-hidden="true" />
                    Registrar uso
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                {reason}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={onRegisterUsageClick}
            aria-label="Registrar uso"
          >
            <Plus aria-hidden="true" />
            Registrar uso
          </Button>
        )}

        {plan.pagarmeSubscriptionId ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopyId}
            aria-label={
              copied ? 'ID copiado' : 'Copiar ID da assinatura Pagar.me'
            }
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? 'Copiado!' : 'Copiar ID Pagar.me'}
          </Button>
        ) : null}

        {onCancelClick ? (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onCancelClick}
            aria-label="Cancelar plano"
          >
            <X aria-hidden="true" />
            Cancelar plano
          </Button>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled
                    aria-disabled="true"
                    aria-label="Cancelar plano (indisponível)"
                  >
                    <X aria-hidden="true" />
                    Cancelar plano
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                Indisponível para planos neste status
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </header>
  );
}
