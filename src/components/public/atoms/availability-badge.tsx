import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type AvailabilityBadgeVariant = 'immediate' | 'after-waiting';

export type AvailabilityBadgeProps = {
  variant: AvailabilityBadgeVariant;
  className?: string;
};

const variantConfig: Record<
  AvailabilityBadgeVariant,
  { label: string; className: string }
> = {
  immediate: {
    label: 'Desde o 1º pagamento',
    className: 'border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]',
  },
  'after-waiting': {
    label: 'Após 180 dias de carência',
    className: 'border-transparent bg-amber-50 text-amber-600 hover:bg-amber-50',
  },
};

export function AvailabilityBadge({ variant, className }: AvailabilityBadgeProps) {
  const config = variantConfig[variant];

  return (
    <Badge className={cn('font-medium', config.className, className)}>
      {config.label}
    </Badge>
  );
}
