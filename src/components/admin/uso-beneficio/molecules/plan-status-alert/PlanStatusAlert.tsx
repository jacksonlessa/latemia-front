import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlanStatus } from '@/lib/types/plan';

interface PlanStatusAlertProps {
  /** Current plan status. The alert renders only for `carencia` and `inadimplente`. */
  status: PlanStatus;
  className?: string;
}

interface AlertVariant {
  message: string;
  containerClass: string;
  iconClass: string;
  textClass: string;
}

/** Visual variants per blocking status. Other statuses render nothing. */
const variants: Partial<Record<PlanStatus, AlertVariant>> = {
  carencia: {
    message:
      'Atenção: este plano ainda está em carência. O atendimento pode não ser coberto pelo plano.',
    containerClass: 'border-amber-200 bg-amber-50',
    iconClass: 'text-amber-600',
    textClass: 'text-amber-800',
  },
  inadimplente: {
    message:
      'Atenção: este plano está inadimplente. Verifique a regularização antes de oferecer cobertura.',
    containerClass: 'border-red-200 bg-red-50',
    iconClass: 'text-red-600',
    textClass: 'text-red-800',
  },
};

/**
 * Molecule — renders a blocking-context banner when the plan status
 * requires explicit attention before booking a benefit usage.
 *
 * Renders `null` when the status does not need a warning (e.g. `ativo`).
 */
export function PlanStatusAlert({ status, className }: PlanStatusAlertProps) {
  const variant = variants[status];

  if (!variant) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        variant.containerClass,
        className,
      )}
    >
      <AlertTriangle
        className={cn('mt-0.5 h-4 w-4 shrink-0', variant.iconClass)}
        aria-hidden="true"
      />
      <p className={cn('text-sm font-medium', variant.textClass)}>
        {variant.message}
      </p>
    </div>
  );
}
