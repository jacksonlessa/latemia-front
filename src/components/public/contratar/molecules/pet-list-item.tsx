'use client';

import { Cat, Dog, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { birthDateToApproximate } from '@/components/public/contratar/molecules/age-input';
import type { RegisterPetInput } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PetListItemProps {
  pet: RegisterPetInput & { _id: string };
  onEdit: () => void;
  onRemove: () => void;
  /** When `false`, the remove button is disabled (e.g. last pet must remain). */
  canRemove: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatApproximateAge(birth: Date): string {
  const { value, unit } = birthDateToApproximate(birth);
  return `${value} ${unit}`;
}

function formatSex(sex: RegisterPetInput['sex']): string {
  return sex === 'male' ? '♂' : '♀';
}

function formatCastrated(sex: RegisterPetInput['sex'], castrated: boolean): string | null {
  if (!castrated) return null;
  return sex === 'female' ? 'castrada' : 'castrado';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PetListItem({ pet, onEdit, onRemove, canRemove }: PetListItemProps) {
  const SpeciesIcon = pet.species === 'felino' ? Cat : Dog;
  const ageLabel = formatApproximateAge(pet.birthDate);
  const sexLabel = formatSex(pet.sex);
  const castratedLabel = formatCastrated(pet.sex, pet.castrated);

  const description = [pet.breed, ageLabel, sexLabel, castratedLabel]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#4E8C75]/15 text-[#3a6b59]"
        >
          <SpeciesIcon className="size-5" strokeWidth={1.8} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-foreground">{pet.name}</div>
          <div className="truncate text-xs text-muted-foreground">{description}</div>
        </div>

        {/* Actions */}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onEdit}
          aria-label={`Editar ${pet.name}`}
          className="text-muted-foreground"
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Remover ${pet.name}`}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
