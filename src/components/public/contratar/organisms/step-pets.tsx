'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PetForm } from '@/components/public/contratar/organisms/pet-form';
import { PetListItem } from '@/components/public/contratar/molecules/pet-list-item';
import type { RegisterPetInput } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StepPetsEditingState = 'new' | string | null;

export interface StepPetsProps {
  pets: Array<RegisterPetInput & { _id: string }>;
  /**
   * Persists a new pet (when `_id` is absent) or updates an existing one
   * (when `_id` is provided). The parent decides insert vs update based on
   * the presence of `_id`.
   */
  onSavePet: (pet: RegisterPetInput & { _id?: string }) => void;
  onRemovePet: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  pricePerPetCents: number;
  /**
   * Optional initial editing state — primarily used by Storybook to force the
   * "editing existing pet" variant. Defaults to `'new'` when the list is empty
   * and `null` otherwise.
   */
  initialEditing?: StepPetsEditingState;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    cents / 100,
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepPets({
  pets,
  onSavePet,
  onRemovePet,
  onNext,
  onBack,
  pricePerPetCents,
  initialEditing,
}: StepPetsProps) {
  const [editing, setEditing] = useState<StepPetsEditingState>(
    initialEditing !== undefined ? initialEditing : pets.length === 0 ? 'new' : null,
  );

  // -------------------------------------------------------------------------
  // State A — PetForm
  // -------------------------------------------------------------------------
  if (editing !== null) {
    const editingPet = editing === 'new' ? undefined : pets.find((p) => p._id === editing);

    return (
      <PetForm
        initial={editingPet}
        onCancel={() => setEditing(null)}
        onSave={(pet) => {
          if (editing === 'new') {
            onSavePet(pet);
          } else {
            onSavePet({ ...pet, _id: editing });
          }
          setEditing(null);
        }}
      />
    );
  }

  // -------------------------------------------------------------------------
  // State B — list + summary + navigation
  // -------------------------------------------------------------------------
  const totalCents = pets.length * pricePerPetCents;
  const petCountLabel =
    pets.length === 1 ? '1 pet cadastrado' : `${pets.length} pets cadastrados`;
  const addLabel = pets.length === 0 ? 'Adicionar pet' : 'Adicionar outro pet';

  return (
    <div className="space-y-5">
      {/* List */}
      <div className="flex flex-col gap-2.5">
        {pets.map((pet) => (
          <PetListItem
            key={pet._id}
            pet={pet}
            onEdit={() => setEditing(pet._id)}
            onRemove={() => onRemovePet(pet._id)}
            canRemove={pets.length > 1}
          />
        ))}

        {/* Add pet (dashed) */}
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="flex items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-border bg-transparent px-4 py-4 text-sm font-semibold text-[#4E8C75] transition-colors hover:bg-[#4E8C75]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75]"
        >
          <Plus className="size-4" strokeWidth={2.2} />
          {addLabel}
        </button>
      </div>

      {/* Pricing summary */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">{petCountLabel}</div>
            <div className="mt-0.5 text-xs text-muted-foreground/80">
              {formatCurrency(pricePerPetCents)} por pet / mês
            </div>
          </div>
          <div className="text-2xl font-medium tracking-tight text-foreground">
            {formatCurrency(totalCents)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">/mês</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="flex-[1.6]"
          disabled={pets.length === 0}
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}
