import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type UserStatus = 'ativo' | 'inativo';

interface StatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function StatusBadge({ isActive, className }: StatusBadgeProps) {
  const status: UserStatus = isActive ? 'ativo' : 'inativo';

  const config = {
    ativo: {
      label: 'Ativo',
      className: 'border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]',
    },
    inativo: {
      label: 'Inativo',
      className: 'border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100',
    },
  }[status];

  return (
    <Badge
      className={cn('font-medium', config.className, className)}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
