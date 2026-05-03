'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { PlanStatusBadge } from '@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge';
import type { PlanStatus } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InactivePlanSummary {
  id: string;
  status: Extract<PlanStatus, 'cancelado' | 'estornado' | 'contestado'>;
  createdAt: string;
  /** Total usages for this plan. `null` when the count is not available (renders as "—"). */
  usagesCount: number | null;
}

interface InactivePlansListProps {
  plans: InactivePlanSummary[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

function formatDate(iso: string): string {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * InactivePlansList — compact list of terminal-status plans (cancelado,
 * estornado, contestado) for the selected pet. Each row links to the full
 * plan detail page.
 */
export function InactivePlansList({ plans }: InactivePlansListProps) {
  if (plans.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="inactive-plans-heading">
      <h3
        id="inactive-plans-heading"
        className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide"
      >
        Histórico de planos
      </h3>

      <ul className="divide-y rounded-lg border" role="list">
        {plans.map((plan) => (
          <li key={plan.id} className="flex items-center gap-3 px-4 py-3">
            {/* Status badge */}
            <PlanStatusBadge status={plan.status} className="shrink-0 text-xs" />

            {/* Date */}
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDate(plan.createdAt)}
            </span>

            {/* Usages */}
            <span className="text-xs text-muted-foreground">
              {plan.usagesCount === null
                ? '—'
                : plan.usagesCount === 1
                  ? '1 uso'
                  : `${plan.usagesCount} usos`}
            </span>

            {/* Spacer */}
            <span className="flex-1" />

            {/* Link to detail */}
            <Link
              href={`/admin/planos/${plan.id}`}
              className="inline-flex items-center gap-1 text-xs text-[#4E8C75] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75] rounded-sm"
              aria-label={`Ver detalhes do plano ${plan.id.slice(0, 8)}`}
            >
              Ver detalhes
              <ExternalLink className="size-3" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
