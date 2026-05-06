'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PetSpeciesBadge } from '@/components/admin/clientes/atoms/pet-species-badge';
import { PlanStatusBadge } from '@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge';
import { cn } from '@/lib/utils';
import { calculatePetAge } from '@/lib/format/pet-age';
import type { PetSpecies } from '@/lib/types/pet';
import type { PlanStatus } from '@/lib/types/plan';

export interface PetListItemData {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  birthDate: string; // ISO date string
  planStatus?: PlanStatus;
}

interface PetListItemProps {
  pet: PetListItemData;
  selected?: boolean;
  onClick?: (petId: string) => void;
}

export function PetListItem({ pet, selected = false, onClick }: PetListItemProps) {
  const initials = pet.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const age = calculatePetAge(new Date(pet.birthDate));

  return (
    <button
      type="button"
      onClick={() => onClick?.(pet.id)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        'hover:bg-[#EAF4F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75]',
        selected
          ? 'bg-[#EAF4F0] border border-[#4E8C75]/30'
          : 'border border-transparent',
      )}
      aria-pressed={selected}
      aria-label={`Selecionar pet ${pet.name}`}
    >
      {/* Avatar placeholder */}
      <Avatar className="size-10 shrink-0">
        <AvatarFallback className="bg-[#4E8C75]/10 text-[#4E8C75] text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-foreground truncate">
            {pet.name}
          </span>
          <PetSpeciesBadge species={pet.species} className="text-xs py-0 px-1.5 h-5" />
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {pet.breed} · {age}
        </p>
      </div>

      {/* Plan status badge (right side) */}
      <div className="shrink-0">
        {pet.planStatus ? (
          <PlanStatusBadge status={pet.planStatus} className="text-xs" />
        ) : (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Sem plano
          </span>
        )}
      </div>
    </button>
  );
}
