import { cn } from '@/lib/utils';
import type { BillingInterval } from '@/lib/billing/types';

interface IntervalLabelProps {
  interval: BillingInterval;
  intervalCount: number;
  className?: string;
}

const intervalNames: Record<BillingInterval, { singular: string; plural: string }> = {
  day: { singular: 'dia', plural: 'dias' },
  week: { singular: 'semana', plural: 'semanas' },
  month: { singular: 'mês', plural: 'meses' },
  year: { singular: 'ano', plural: 'anos' },
};

const shortLabels: Record<BillingInterval, string> = {
  day: 'diário',
  week: 'semanal',
  month: 'mensal',
  year: 'anual',
};

/**
 * Formats a billing interval into a human-readable label.
 * - intervalCount === 1  → "mensal", "anual", etc.
 * - intervalCount > 1   → "a cada 3 meses", "a cada 2 semanas", etc.
 */
export function IntervalLabel({ interval, intervalCount, className }: IntervalLabelProps) {
  const label =
    intervalCount === 1
      ? shortLabels[interval]
      : `a cada ${intervalCount} ${intervalCount > 1 ? intervalNames[interval].plural : intervalNames[interval].singular}`;

  return (
    <span className={cn('text-sm text-muted-foreground capitalize', className)} aria-label={`Intervalo: ${label}`}>
      {label}
    </span>
  );
}
