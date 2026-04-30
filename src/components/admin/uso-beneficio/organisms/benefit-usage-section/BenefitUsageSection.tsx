'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BenefitUsageRow } from '@/components/admin/uso-beneficio/molecules/benefit-usage-row/BenefitUsageRow';
import { BenefitUsageModal } from '@/components/admin/uso-beneficio/organisms/benefit-usage-modal/BenefitUsageModal';
import type { PlanDetail, PlanStatus } from '@/lib/types/plan';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface BenefitUsageSectionProps {
  /**
   * Full plan detail. Used both as context for the modal (via `PlanSummary`
   * shape) and to gate the "Registrar uso" button by status.
   */
  plan: PlanDetail;
  /** Initial usages snapshot (Server-rendered). */
  initialUsages: BenefitUsageResponse[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Plan statuses where creating a new usage is blocked at the UI level. */
const BLOCKED_STATUSES: ReadonlySet<PlanStatus> = new Set<PlanStatus>([
  'pendente',
  'cancelado',
]);

function isUsageBlocked(status: PlanStatus): boolean {
  return BLOCKED_STATUSES.has(status);
}

/** Localized explanation shown inside the tooltip when the button is disabled. */
function blockedReasonLabel(status: PlanStatus): string {
  if (status === 'pendente') {
    return 'Não é possível registrar uso enquanto o plano está pendente.';
  }
  if (status === 'cancelado') {
    return 'Não é possível registrar uso em planos cancelados.';
  }
  return 'Não é possível registrar uso no status atual deste plano.';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * BenefitUsageSection — Organism (Client Component).
 *
 * Renders the "Uso do Benefício" section on `/admin/planos/[id]`:
 *
 * - Header with title and "Registrar uso" CTA (disabled in `pendente`/`cancelado`
 *   with an explanatory tooltip);
 * - Table listing every usage of the plan in `attendedAt desc` order — no
 *   "Editar" column on this screen (edit lives only on the global page);
 * - Friendly empty state when no usages exist;
 * - On modal `onSuccess`, calls `router.refresh()` so the Server Component
 *   re-fetches the freshly created entry without a full page reload.
 */
export function BenefitUsageSection({
  plan,
  initialUsages,
}: BenefitUsageSectionProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const blocked = isUsageBlocked(plan.status);
  const blockedReason = useMemo(() => blockedReasonLabel(plan.status), [
    plan.status,
  ]);

  // The modal expects a `PlanSummary` — derive a stable, minimal shape so we
  // do not pass extra fields the form does not need.
  const planSummary = useMemo(
    () => ({
      id: plan.id,
      status: plan.status,
      petName: plan.pet.name,
      clientName: plan.client.name,
    }),
    [plan.client.name, plan.id, plan.pet.name, plan.status],
  );

  const handleOpenModal = useCallback(() => {
    if (blocked) return;
    setIsModalOpen(true);
  }, [blocked]);

  const handleSuccess = useCallback(() => {
    // Refresh the Server Component to reload `initialUsages` with the new
    // record. Client interactivity state (like modal open) is preserved by
    // Next.js across the refresh.
    router.refresh();
  }, [router]);

  // ------------------------------- Render --------------------------------

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h2 className="text-base font-semibold text-[#2C2C2E]">
          Uso do Benefício ({initialUsages.length})
        </h2>

        {blocked ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Disabled buttons swallow pointer events; wrap in a span so
                    the tooltip still gets hover/focus signals. */}
                <span tabIndex={0} aria-describedby="registrar-uso-blocked">
                  <Button
                    type="button"
                    disabled
                    aria-disabled="true"
                    aria-label="Registrar uso"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Registrar uso
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent
                id="registrar-uso-blocked"
                side="bottom"
                align="end"
              >
                {blockedReason}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button type="button" onClick={handleOpenModal}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Registrar uso
          </Button>
        )}
      </div>

      {/* List or empty state */}
      {initialUsages.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#6B6B6E]">
          Nenhum uso de benefício registrado para este plano.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Procedimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsages.map((usage) => (
              <BenefitUsageRow
                key={usage.id}
                usage={usage}
                canEdit={false}
              />
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal — only mounted when actionable to keep the tree light. */}
      {!blocked ? (
        <BenefitUsageModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          plan={planSummary}
          onSuccess={handleSuccess}
        />
      ) : null}
    </div>
  );
}
