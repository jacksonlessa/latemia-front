import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PetSpecies } from '@/lib/types/pet';

interface PetSpeciesBadgeProps {
  species: PetSpecies;
  className?: string;
}

const speciesConfig: Record<PetSpecies, { label: string; className: string }> = {
  canino: {
    label: 'Canino',
    className: 'border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]',
  },
  felino: {
    label: 'Felino',
    className: 'border-transparent bg-blue-50 text-blue-600 hover:bg-blue-50',
  },
};

export function PetSpeciesBadge({ species, className }: PetSpeciesBadgeProps) {
  const config = speciesConfig[species];

  return (
    <Badge
      className={cn('font-medium', config.className, className)}
      aria-label={`Espécie: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
