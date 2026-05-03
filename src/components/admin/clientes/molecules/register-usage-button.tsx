'use client';

import { useState, useCallback } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FrictionConfirmDialog } from '@/components/admin/clientes/molecules/friction-confirm-dialog';
import { BenefitUsageModal } from '@/components/admin/uso-beneficio/organisms/benefit-usage-modal/BenefitUsageModal';
import type { PlanSummary } from '@/lib/types/plan';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RegisterUsageButtonProps {
  plan: PlanSummary | undefined;
  onRegistered?: (usage: BenefitUsageResponse) => void;
}

// ---------------------------------------------------------------------------
// Disabled reason per status
// ---------------------------------------------------------------------------

const disabledTooltip: Partial<Record<string, string>> = {
  pendente:
    'Não é possível registrar uso em plano pendente de confirmação de pagamento.',
  cancelado: 'Não é possível registrar uso em plano cancelado.',
  estornado: 'Não é possível registrar uso em plano estornado.',
  contestado: 'Não é possível registrar uso em plano contestado (chargeback).',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * RegisterUsageButton — wrapper molecule that gates benefit usage registration
 * based on the plan status:
 *
 * - `ativo` → opens BenefitUsageModal directly
 * - `carencia | inadimplente` → shows FrictionConfirmDialog first; on confirm
 *   opens BenefitUsageModal
 * - `pendente | cancelado | estornado | contestado` → button disabled with tooltip
 * - `undefined` (no plan) → renders nothing
 */
export function RegisterUsageButton({ plan, onRegistered }: RegisterUsageButtonProps) {
  const [frictionOpen, setFrictionOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleButtonClick = useCallback(() => {
    if (!plan) return;

    if (plan.status === 'ativo') {
      setModalOpen(true);
      return;
    }

    if (plan.status === 'carencia' || plan.status === 'inadimplente') {
      setFrictionOpen(true);
      return;
    }
  }, [plan]);

  const handleFrictionConfirm = useCallback(() => {
    setFrictionOpen(false);
    setModalOpen(true);
  }, []);

  const handleUsageSuccess = useCallback(
    (usage: BenefitUsageResponse) => {
      setModalOpen(false);
      onRegistered?.(usage);
    },
    [onRegistered],
  );

  // No plan → render nothing
  if (!plan) return null;

  const tooltipMessage = disabledTooltip[plan.status];
  const isDisabled = !!tooltipMessage;
  // Stable id for the tooltip text so aria-describedby works across renders
  const tooltipId = `register-usage-tooltip-${plan.id}`;

  const button = (
    <Button
      onClick={isDisabled ? undefined : handleButtonClick}
      // Use aria-disabled instead of HTML disabled so the button remains
      // focusable and screen readers announce the reason via aria-describedby.
      aria-disabled={isDisabled || undefined}
      aria-describedby={isDisabled ? tooltipId : undefined}
      className={
        isDisabled
          ? 'cursor-not-allowed opacity-50'
          : 'bg-[#4E8C75] text-white hover:bg-[#4E8C75]/90'
      }
      aria-label="Registrar uso de benefício"
    >
      <ClipboardCheck className="size-4" aria-hidden="true" />
      Registrar uso
    </Button>
  );

  return (
    <>
      {isDisabled ? (
        <>
          {/*
           * The sr-only span carries the id so that aria-describedby on the
           * button points to text in the same DOM tree (not a portal).
           * The visual Tooltip provides the same text for pointer users.
           */}
          <span id={tooltipId} className="sr-only">
            {tooltipMessage}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">{button}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipMessage}</p>
            </TooltipContent>
          </Tooltip>
        </>
      ) : (
        button
      )}

      {/* Friction Dialog — only for carencia / inadimplente */}
      {(plan.status === 'carencia' || plan.status === 'inadimplente') && (
        <FrictionConfirmDialog
          open={frictionOpen}
          onOpenChange={setFrictionOpen}
          status={plan.status}
          onConfirm={handleFrictionConfirm}
        />
      )}

      {/* Benefit Usage Modal */}
      <BenefitUsageModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        plan={plan}
        onSuccess={handleUsageSuccess}
      />
    </>
  );
}
