import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PlanMetricVariant = 'default' | 'success' | 'warn';

interface PlanMetricCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  variant?: PlanMetricVariant;
}

const variantClasses: Record<PlanMetricVariant, string> = {
  default: 'bg-white border-gray-100',
  success: 'bg-[#EAF4F0] border-[#D4E8DE]',
  warn: 'bg-amber-50 border-amber-200',
};

const labelClasses: Record<PlanMetricVariant, string> = {
  default: 'text-[#6B6B6E]',
  success: 'text-[#4E8C75]',
  warn: 'text-amber-700',
};

const valueClasses: Record<PlanMetricVariant, string> = {
  default: 'text-[#2C2C2E]',
  success: 'text-[#4E8C75]',
  warn: 'text-amber-700',
};

const subClasses: Record<PlanMetricVariant, string> = {
  default: 'text-[#6B6B6E]',
  success: 'text-[#4E8C75]',
  warn: 'text-amber-700',
};

export function PlanMetricCard({
  label,
  value,
  sub,
  variant = 'default',
}: PlanMetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md',
        variantClasses[variant],
      )}
    >
      <div
        className={cn(
          'text-[10px] font-bold uppercase tracking-wider',
          labelClasses[variant],
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'mt-1.5 text-base font-semibold leading-tight',
          valueClasses[variant],
        )}
      >
        {value}
      </div>
      {sub ? (
        <div className={cn('mt-1 text-xs', subClasses[variant])}>{sub}</div>
      ) : null}
    </div>
  );
}
