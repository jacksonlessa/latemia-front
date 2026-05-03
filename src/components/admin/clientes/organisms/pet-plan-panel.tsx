'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ActivePlanCard,
  type ActivePlanDetail,
} from '@/components/admin/clientes/molecules/active-plan-card';
import {
  InactivePlansList,
  type InactivePlanSummary,
} from '@/components/admin/clientes/molecules/inactive-plans-list';
import { RegisterUsageButton } from '@/components/admin/clientes/molecules/register-usage-button';
import {
  deactivatePetUseCase,
  PetHasPlansError,
} from '@/domain/pet/deactivate-pet.use-case';
import type { PetListItem } from '@/lib/types/client';
import type { PlanListItem, PlanStatus, PlanSummary } from '@/lib/types/plan';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PetPlanPanelProps {
  pet: PetListItem;
  clientId: string;
  /** All plans for the client — the panel filters and picks the active plan. */
  allPlans: PlanListItem[];
  /** Client name, used to populate PlanSummary for BenefitUsageModal. */
  clientName: string;
  /** Called when a usage is registered successfully. */
  onUsageRegistered?: (usage: BenefitUsageResponse) => void;
  /** Optional: open edit-pet drawer. Placeholder for Task 5.0. */
  onEditPet?: () => void;
  /** Called when the pet has been successfully deactivated. */
  onDeactivated?: () => void;
}

// ---------------------------------------------------------------------------
// Constants / helpers
// ---------------------------------------------------------------------------

/** Statuses that qualify as "vigente" (active) — ordered by priority. */
const VIGENTE_PRIORITY: PlanStatus[] = [
  'ativo',
  'carencia',
  'inadimplente',
  'pendente',
];

/** Statuses that are considered inactive history. */
const INACTIVE_STATUSES: PlanStatus[] = ['cancelado', 'estornado', 'contestado'];

function pickActivePlan(plans: PlanListItem[]): PlanListItem | undefined {
  for (const status of VIGENTE_PRIORITY) {
    const found = plans.find((p) => p.status === status);
    if (found) return found;
  }
  return undefined;
}

/**
 * Fetch lazy plan detail from the internal Route Handler.
 * Returns null on error (graceful degradation).
 */
async function fetchActivePlanDetail(
  planId: string,
  signal: AbortSignal,
): Promise<ActivePlanDetail | null> {
  try {
    const res = await fetch(`/api/admin/plans/${encodeURIComponent(planId)}`, {
      signal,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ActivePlanDetail & {
      payments?: ActivePlanDetail['payments'];
    };
    return {
      id: data.id,
      status: data.status,
      createdAt: data.createdAt,
      gracePeriodEndsAt: data.gracePeriodEndsAt,
      payments: data.payments ?? [],
    };
  } catch {
    return null;
  }
}

/**
 * Fetch count of benefit usages for a plan.
 * Returns null on error.
 */
async function fetchUsagesCount(
  planId: string,
  signal: AbortSignal,
): Promise<number | null> {
  try {
    const res = await fetch(
      `/api/admin/benefit-usages/by-plan/${encodeURIComponent(planId)}`,
      { signal, cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as BenefitUsageResponse[];
    return Array.isArray(data) ? data.length : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * PetPlanPanel — Client Component that displays a pet's active plan detail,
 * history of inactive plans, and the "Registrar uso" action.
 *
 * Lazy-fetches the `PlanDetail` and `usagesCount` when the pet changes, using
 * `AbortController` to cancel obsolete requests.
 */
export function PetPlanPanel({
  pet,
  clientId,
  allPlans,
  clientName,
  onUsageRegistered,
  onEditPet,
  onDeactivated,
}: PetPlanPanelProps) {
  // Filter by petId for deterministic association (pet names are non-unique per client)
  const petPlans = allPlans.filter((p) => p.petId === pet.id);

  const activePlanItem = pickActivePlan(petPlans);
  const inactivePlans: InactivePlanSummary[] = petPlans
    .filter((p): p is PlanListItem & { status: InactivePlanSummary['status'] } =>
      (INACTIVE_STATUSES as PlanStatus[]).includes(p.status),
    )
    .map((p) => ({
      id: p.id,
      status: p.status as InactivePlanSummary['status'],
      createdAt: p.createdAt,
      usagesCount: null, // count not available in PlanListItem; rendered as "—" in the list
    }));

  // Lazy-fetched plan detail
  const [planDetail, setPlanDetail] = useState<ActivePlanDetail | null>(null);
  const [usagesCount, setUsagesCount] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Deactivation state
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateInlineError, setDeactivateInlineError] = useState<string | null>(null);

  // Determine whether the deactivate button should be visible:
  // visible only when this pet has no plans at all (any status).
  const petHasNoPlans = petPlans.length === 0;

  useEffect(() => {
    // Cancel any in-flight request from the previous pet
    abortRef.current?.abort();

    if (!activePlanItem) {
      setPlanDetail(null);
      setUsagesCount(null);
      setLoadingDetail(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingDetail(true);
    setPlanDetail(null);
    setUsagesCount(null);

    Promise.all([
      fetchActivePlanDetail(activePlanItem.id, controller.signal),
      fetchUsagesCount(activePlanItem.id, controller.signal),
    ])
      .then(([detail, count]) => {
        if (controller.signal.aborted) return;
        setPlanDetail(detail);
        setUsagesCount(count);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDetail(false);
      });

    return () => {
      controller.abort();
    };
  }, [activePlanItem?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build PlanSummary for RegisterUsageButton / BenefitUsageModal
  const planSummary: PlanSummary | undefined = activePlanItem
    ? {
        id: activePlanItem.id,
        status: activePlanItem.status,
        petName: pet.name,
        clientName,
      }
    : undefined;

  const handleUsageRegistered = (usage: BenefitUsageResponse) => {
    // Optimistically increment the usage counter
    setUsagesCount((prev) => (prev !== null ? prev + 1 : 1));
    onUsageRegistered?.(usage);
  };

  /**
   * Handles the "Inativar" confirmation.
   * Prevents the AlertDialog from auto-closing while the request is in-flight,
   * then closes it on success or on PetHasPlansError.
   */
  const handleDeactivateConfirm = async (e: React.MouseEvent) => {
    // Prevent the default Radix close behaviour so we can control it manually.
    e.preventDefault();

    setIsDeactivating(true);
    setDeactivateInlineError(null);

    try {
      await deactivatePetUseCase({ clientId, petId: pet.id });
      setDeactivateDialogOpen(false);
      onDeactivated?.();
    } catch (err) {
      if (err instanceof PetHasPlansError) {
        setDeactivateDialogOpen(false);
        setDeactivateInlineError(
          'Este pet possui planos associados e não pode ser inativado.',
        );
      } else {
        // Generic error — show inline message; dialog remains closed
        setDeactivateDialogOpen(false);
        setDeactivateInlineError(
          'Ocorreu um erro ao inativar o pet. Tente novamente.',
        );
      }
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <section aria-label={`Plano e informações de ${pet.name}`} className="space-y-4">
      {/* Pet identity + action buttons */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">{pet.name}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditPet}
            aria-label={`Editar dados de ${pet.name}`}
            data-testid="edit-pet-button"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Editar pet
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            aria-label={`Ver ficha do pet ${pet.name}`}
          >
            <Link href={`/admin/clientes/${clientId}/pets/${pet.id}`}>
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Ver ficha do pet
            </Link>
          </Button>
          {activePlanItem && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              aria-label="Ver detalhes do plano vigente"
            >
              <Link href={`/admin/planos/${activePlanItem.id}`}>
                <ExternalLink className="size-3.5" aria-hidden="true" />
                Ver detalhes Plano
              </Link>
            </Button>
          )}
          {petHasNoPlans && (
            <AlertDialog
              open={deactivateDialogOpen}
              onOpenChange={setDeactivateDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Inativar pet ${pet.name}`}
                  data-testid="deactivate-pet-button"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Inativar pet
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Inativar {pet.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação removerá o pet de todas as telas. Pets com planos
                    não podem ser inativados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeactivating}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeactivating}
                    onClick={handleDeactivateConfirm}
                    data-testid="confirm-deactivate-button"
                  >
                    {isDeactivating && (
                      <Loader2
                        className="mr-2 size-4 animate-spin"
                        aria-hidden="true"
                      />
                    )}
                    Inativar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Inline deactivation error — shown below the button row */}
      {deactivateInlineError && (
        <p
          role="alert"
          data-testid="deactivate-inline-error"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive"
        >
          {deactivateInlineError}
        </p>
      )}

      {/* Active plan card */}
      {activePlanItem ? (
        <>
          <ActivePlanCard
            plan={planDetail}
            usagesCount={usagesCount}
            loading={loadingDetail}
          />

          {/* Register usage action */}
          <div className="flex justify-end">
            <RegisterUsageButton
              plan={planSummary}
              onRegistered={handleUsageRegistered}
            />
          </div>

        </>
      ) : (
        <div className="rounded-lg border bg-muted/30 px-4 py-6 text-center" data-testid="no-plan-message">
          <p className="text-sm text-muted-foreground">
            Nenhum plano encontrado para <strong>{pet.name}</strong>.
          </p>
        </div>
      )}

      {/* Inactive plans history */}
      {inactivePlans.length > 0 && (
        <InactivePlansList plans={inactivePlans} />
      )}
    </section>
  );
}
