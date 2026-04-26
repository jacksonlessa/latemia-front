import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BillingPlanStatus } from '@/lib/billing/types';

interface StatusBadgeProps {
  status: BillingPlanStatus;
  className?: string;
}

const statusConfig: Record<BillingPlanStatus, { label: string; className: string }> = {
  active: {
    label: 'Ativo',
    className: 'border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]',
  },
  inactive: {
    label: 'Inativo',
    className: 'border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      className={cn('font-medium', config.className, className)}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
