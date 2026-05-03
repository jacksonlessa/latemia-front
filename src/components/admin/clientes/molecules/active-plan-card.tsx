'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { PlanStatusBadge } from '@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge';
import { cn } from '@/lib/utils';
import type { PlanStatus, Payment } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of a plan as displayed in the active plan card. */
export interface ActivePlanDetail {
  id: string;
  status: PlanStatus;
  createdAt: string;
  gracePeriodEndsAt?: string;
  payments: Payment[];
}

interface ActivePlanCardProps {
  plan: ActivePlanDetail | null;
  usagesCount: number | null;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusHeaderClass: Partial<Record<PlanStatus, string>> = {
  ativo: 'bg-[#EAF4F0] border-[#4E8C75]/20',
  carencia: 'bg-amber-50 border-amber-200',
  inadimplente: 'bg-red-50 border-red-200',
  pendente: 'bg-slate-50 border-slate-200',
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

function getLastPayment(payments: Payment[]): Payment | undefined {
  if (payments.length === 0) return undefined;
  return [...payments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

const paymentStatusLabel: Record<string, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  em_atraso: 'Em atraso',
  inadimplente: 'Inadimplente',
  cancelado: 'Cancelado',
  estornado: 'Estornado',
  contestado: 'Contestado',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ActivePlanCard — purely presentational molecule.
 *
 * Displays the active plan details for the selected pet, including:
 * - Header colored by plan status
 * - Plan status badge
 * - Start date
 * - Stats: grace period end, last payment, total usages
 * - Skeleton state during loading
 */
export function ActivePlanCard({ plan, usagesCount, loading = false }: ActivePlanCardProps) {
  // Loading state
  if (loading) {
    return (
      <div className="rounded-lg border overflow-hidden" aria-busy="true" aria-label="Carregando plano ativo">
        <div className="bg-slate-50 border-b px-4 py-3">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <Skeleton className="h-12 rounded-md" />
            <Skeleton className="h-12 rounded-md" />
            <Skeleton className="h-12 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state — pet has no active plan
  if (!plan) {
    return (
      <div className="rounded-lg border bg-muted/30 px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Este pet não possui plano vigente.
        </p>
      </div>
    );
  }

  const lastPayment = getLastPayment(plan.payments);
  const headerClass = statusHeaderClass[plan.status] ?? 'bg-slate-50 border-slate-200';

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Colored header */}
      <div
        className={cn('border-b px-4 py-3 flex items-center justify-between', headerClass)}
      >
        <span className="text-sm font-semibold text-foreground">Plano ativo</span>
        <PlanStatusBadge status={plan.status} />
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Start date */}
        <p className="text-xs text-muted-foreground">
          Início:{' '}
          <span className="font-medium text-foreground">
            {formatDate(plan.createdAt)}
          </span>
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Grace period */}
          <div className="rounded-md bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Fim da carência</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {formatDate(plan.gracePeriodEndsAt)}
            </p>
          </div>

          {/* Last payment */}
          <div className="rounded-md bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Último pagamento</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {lastPayment
                ? `${paymentStatusLabel[lastPayment.status] ?? lastPayment.status} · ${formatDate(lastPayment.paidAt ?? lastPayment.createdAt)}`
                : '—'}
            </p>
          </div>

          {/* Total usages */}
          <div className="rounded-md bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Total de usos</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {usagesCount !== null ? usagesCount : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
