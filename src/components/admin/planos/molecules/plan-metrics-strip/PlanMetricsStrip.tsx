import { PlanMetricCard } from '@/components/admin/planos/atoms/plan-metric-card/PlanMetricCard';
import type { PlanDetail } from '@/lib/types/plan';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

interface PlanMetricsStripProps {
  plan: PlanDetail;
  benefitUsages: BenefitUsageResponse[];
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function safeDate(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(iso?: string): string {
  const d = safeDate(iso);
  return d ? dateFormatter.format(d) : '—';
}

function formatTime(iso?: string): string {
  const d = safeDate(iso);
  return d ? timeFormatter.format(d) : '';
}

/**
 * Computes the human countdown to the end of the grace period. Returns:
 * - `null` if the date is invalid or in the past (carência already finished)
 * - "X meses restantes" / "1 mês restante" / "X dias restantes" otherwise
 */
function graceCountdown(iso?: string): string | null {
  const target = safeDate(iso);
  if (!target) return null;
  const now = Date.now();
  const diffMs = target.getTime() - now;
  if (diffMs <= 0) return null;

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} ${days === 1 ? 'dia restante' : 'dias restantes'}`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? 'mês restante' : 'meses restantes'}`;
}

function totalDiscount(usages: BenefitUsageResponse[]): number {
  return usages.reduce((acc, u) => {
    const v = Number(u.discountApplied);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
}

export function PlanMetricsStrip({ plan, benefitUsages }: PlanMetricsStripProps) {
  const createdTime = formatTime(plan.createdAt);
  const firstPaidLabel = plan.firstPaidAt
    ? `Paga · ${plan.payments[0]?.amount !== undefined ? currencyFormatter.format(Number(plan.payments[0].amount)) : '—'}`
    : 'Aguardando pagamento';

  const graceLabel = graceCountdown(plan.gracePeriodEndsAt);
  const graceVariant = graceLabel ? 'warn' : 'default';

  const usageCount = benefitUsages.length;
  const usageTotal = totalDiscount(benefitUsages);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <PlanMetricCard
        label="Criado em"
        value={formatDate(plan.createdAt)}
        sub={createdTime || undefined}
      />
      <PlanMetricCard
        label="Primeira cobrança"
        value={formatDate(plan.firstPaidAt)}
        sub={firstPaidLabel}
        variant={plan.firstPaidAt ? 'success' : 'default'}
      />
      <PlanMetricCard
        label="Carência termina"
        value={formatDate(plan.gracePeriodEndsAt)}
        sub={graceLabel ?? 'Carência encerrada'}
        variant={graceVariant}
      />
      <PlanMetricCard
        label="Uso do benefício"
        value={String(usageCount)}
        sub={
          usageCount > 0
            ? `${currencyFormatter.format(usageTotal)} em descontos`
            : 'Nenhum uso registrado'
        }
      />
    </div>
  );
}
