import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EmergencyBadgeProps {
  /** True renders the red "Emergência" pill, false the gray "Eletivo" pill. */
  isEmergency: boolean;
  className?: string;
}

const config = {
  emergency: {
    label: 'Emergência',
    className:
      'border-transparent bg-red-100 text-red-700 hover:bg-red-100',
  },
  elective: {
    label: 'Eletivo',
    className:
      'border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100',
  },
} as const;

/**
 * Atom — visually distinguishes emergency vs elective benefit usages.
 */
export function EmergencyBadge({ isEmergency, className }: EmergencyBadgeProps) {
  const variant = isEmergency ? config.emergency : config.elective;

  return (
    <Badge
      className={cn('font-medium', variant.className, className)}
      aria-label={`Tipo de atendimento: ${variant.label}`}
    >
      {variant.label}
    </Badge>
  );
}
