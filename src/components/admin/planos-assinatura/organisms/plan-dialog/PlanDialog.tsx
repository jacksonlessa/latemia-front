'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanForm } from '@/components/admin/planos-assinatura/organisms/plan-form/PlanForm';
import type { Plan, CreatePlanInput } from '@/lib/billing/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanActionResult<T = Plan> {
  ok: boolean;
  data?: T;
  errorCode?: string;
  message?: string;
}

interface PlanDialogProps {
  mode: 'create' | 'edit';
  /** Required when mode === 'edit' */
  planId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Server action callbacks — no token needed in the client */
  onFetchPlan?: (id: string) => Promise<PlanActionResult>;
  onCreatePlan: (input: CreatePlanInput, idempotencyKey: string) => Promise<PlanActionResult>;
  onUpdatePlan: (id: string, input: Partial<CreatePlanInput>, idempotencyKey: string) => Promise<PlanActionResult>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveErrorMessage(result: PlanActionResult | unknown): string {
  if (result && typeof result === 'object' && 'message' in result && typeof (result as PlanActionResult).message === 'string') {
    return (result as PlanActionResult).message!;
  }
  if (result instanceof Error) return result.message;
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function FormLoadingSkeleton() {
  return (
    <div className="space-y-4 py-2" aria-label="Carregando formulário">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

/**
 * Dialog wrapper for creating or editing a billing plan.
 *
 * Responsibilities:
 * - Fetches plan data when mode === 'edit' and the dialog opens.
 * - Generates a single idempotency key per dialog session (reused on retries).
 * - Delegates form rendering to PlanForm.
 * - Handles API calls (createPlan / updatePlan) and surfaces errors.
 * - Calls onSuccess() + onClose() on success.
 */
export function PlanDialog({
  mode,
  planId,
  open,
  onClose,
  onSuccess,
  onFetchPlan,
  onCreatePlan,
  onUpdatePlan,
}: PlanDialogProps) {
  const [plan, setPlan] = useState<Plan | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Idempotency key is generated once when the dialog opens and reused
   * across retries within the same dialog session.
   */
  const idempotencyKeyRef = useRef<string>('');

  // Reset state and fetch plan data when dialog opens
  useEffect(() => {
    if (!open) {
      // Reset state on close so the dialog is clean next time
      setPlan(undefined);
      setFetchError(null);
      setSubmitError(null);
      setIsSubmitting(false);
      return;
    }

    // Generate fresh idempotency key each time the dialog opens
    idempotencyKeyRef.current = crypto.randomUUID();

    if (mode === 'edit' && planId && onFetchPlan) {
      setIsFetching(true);
      setFetchError(null);

      onFetchPlan(planId)
        .then((result) => {
          if (result.ok && result.data) {
            setPlan(result.data);
          } else {
            setFetchError(resolveErrorMessage(result));
          }
        })
        .catch((err: unknown) => {
          setFetchError(resolveErrorMessage(err));
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [open, mode, planId, onFetchPlan]);

  async function handleSubmit(data: CreatePlanInput): Promise<void> {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let result: PlanActionResult;
      if (mode === 'create') {
        result = await onCreatePlan(data, idempotencyKeyRef.current);
      } else {
        if (!planId) throw new Error('planId é obrigatório para edição.');
        result = await onUpdatePlan(planId, data, idempotencyKeyRef.current);
      }

      if (result.ok) {
        onSuccess();
        onClose();
      } else {
        setSubmitError(resolveErrorMessage(result));
      }
    } catch (err: unknown) {
      setSubmitError(resolveErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = mode === 'create' ? 'Novo Plano' : 'Editar Plano';
  const description =
    mode === 'create'
      ? 'Preencha os dados para criar um novo plano de assinatura na Pagar.me.'
      : 'Altere os dados do plano de assinatura.';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
        aria-describedby="plan-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="plan-dialog-description">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Fetch error state (edit mode only) */}
        {fetchError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {fetchError}
          </div>
        )}

        {/* Loading skeleton while fetching edit data */}
        {isFetching && <FormLoadingSkeleton />}

        {/* Render form when ready */}
        {!isFetching && !fetchError && (mode === 'create' || plan) && (
          <PlanForm
            initialData={plan}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            errorMessage={submitError ?? undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
