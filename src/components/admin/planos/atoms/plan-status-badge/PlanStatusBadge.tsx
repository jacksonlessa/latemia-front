import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PlanStatus } from '@/lib/types/plan';

interface PlanStatusBadgeProps {
  status: PlanStatus;
  className?: string;
}

const statusConfig: Record<PlanStatus, { label: string; className: string }> = {
  pendente: {
    label: 'Pendente',
    className:
      'border-transparent bg-amber-50 text-amber-600 hover:bg-amber-50',
  },
  carencia: {
    label: 'Carência',
    className:
      'border-transparent bg-orange-50 text-orange-500 hover:bg-orange-50',
  },
  ativo: {
    label: 'Ativo',
    className:
      'border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]',
  },
  inadimplente: {
    label: 'Inadimplente',
    className:
      'border-transparent bg-red-50 text-red-600 hover:bg-red-50',
  },
  cancelado: {
    label: 'Cancelado',
    className:
      'border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100',
  },
};

export function PlanStatusBadge({ status, className }: PlanStatusBadgeProps) {
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
