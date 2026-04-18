import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Role = 'admin' | 'atendente';

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

const roleConfig: Record<Role, { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]',
  },
  atendente: {
    label: 'Atendente',
    className:
      'border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100',
  },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <Badge
      className={cn('font-medium', config.className, className)}
      aria-label={`Papel: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
