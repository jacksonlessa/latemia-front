'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PetCard } from '@/components/public/contratar/molecules/pet-card';
import type { RegisterPetInput } from '@/lib/types/pet';

export interface StepPetsProps {
  pets: Array<Partial<RegisterPetInput> & { _id: string }>;
  errors: Record<string, string>;
  onPetChange: (id: string, field: keyof RegisterPetInput, value: unknown) => void;
  /** Callback to add a new pet. The caller must include `age_months: 0` in the initial object. */
  onAddPet: () => void;
  onRemovePet: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  pricePerPetCents: number;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    cents / 100,
  );
}

function extractPetErrors(
  errors: Record<string, string>,
  index: number,
): Record<string, string> {
  const prefix = `pets[${index}].`;
  const petErrors: Record<string, string> = {};
  for (const key of Object.keys(errors)) {
    if (key.startsWith(prefix)) {
      petErrors[key.slice(prefix.length)] = errors[key];
    }
  }
  return petErrors;
}

export function StepPets({
  pets,
  errors,
  onPetChange,
  onAddPet,
  onRemovePet,
  onNext,
  onBack,
  pricePerPetCents,
}: StepPetsProps) {
  const totalCents = pets.length * pricePerPetCents;

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Seus pets</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os dados de cada pet que deseja incluir no plano.
        </p>
      </div>

      {/* Pet cards */}
      <div className="space-y-4">
        {pets.map((pet, index) => (
          <PetCard
            key={pet._id}
            index={index}
            data={pet}
            errors={extractPetErrors(errors, index)}
            onChange={(field, value) => onPetChange(pet._id, field, value)}
            onRemove={() => onRemovePet(pet._id)}
            canRemove={pets.length > 1}
          />
        ))}
      </div>

      {/* Add pet button */}
      <Button
        type="button"
        variant="outline"
        onClick={onAddPet}
        className="w-full border-dashed"
      >
        <Plus />
        Adicionar outro pet
      </Button>

      {/* Footer: subtotal + navigation */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(pricePerPetCents)} × {pets.length} pet{pets.length !== 1 ? 's' : ''}
          </span>
          <span className="font-semibold text-foreground">{formatCurrency(totalCents)}</span>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Voltar
          </Button>
          <Button type="button" onClick={onNext} className="flex-1" disabled={pets.length === 0}>
            Avançar
          </Button>
        </div>
      </div>
    </div>
  );
}
