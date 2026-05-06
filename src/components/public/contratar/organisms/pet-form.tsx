'use client';

import React, { useId, useState } from 'react';
import { Cat, Dog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SexToggle } from '@/components/contratar/atoms/sex-toggle';
import { AgeInput } from '@/components/public/contratar/molecules/age-input';
import { PetEntity } from '@/domain/pet/pet.entity';
import { ValidationError } from '@/lib/validation-error';
import { cn } from '@/lib/utils';
import type { PetSpecies, PetSex, RegisterPetInput } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PetFormProps {
  /** Optional initial values. When omitted the form renders in "new" mode. */
  initial?: Partial<RegisterPetInput>;
  /** Called with a fully validated pet input when the user clicks Save. */
  onSave: (pet: RegisterPetInput) => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Pure helpers (exported for unit tests)
// ---------------------------------------------------------------------------

/**
 * Parse a Brazilian-formatted weight string ("5,2" or "5.2") into a number.
 * Returns `undefined` when the string cannot be parsed to a finite number.
 */
export function parseWeight(raw: string): number | undefined {
  if (raw.trim() === '') return undefined;
  const n = Number.parseFloat(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

/** Convert a numeric weight back to a pt-BR display string (e.g. "5,2"). */
export function formatWeight(value: number | undefined): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return '';
  return String(value).replace('.', ',');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SPECIES_OPTIONS: { label: string; value: PetSpecies; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Cachorro', value: 'canino', Icon: Dog },
  { label: 'Gato', value: 'felino', Icon: Cat },
];

export function PetForm({ initial, onSave, onCancel }: PetFormProps) {
  const baseId = useId();
  const isEdit = Boolean(initial);

  const [name, setName] = useState<string>(initial?.name ?? '');
  const [species, setSpecies] = useState<PetSpecies | undefined>(initial?.species);
  const [breed, setBreed] = useState<string>(initial?.breed ?? '');
  const [birthDate, setBirthDate] = useState<Date | undefined>(initial?.birthDate);
  const [sex, setSex] = useState<PetSex | undefined>(initial?.sex);
  const [weightStr, setWeightStr] = useState<string>(formatWeight(initial?.weight));
  const [castrated, setCastrated] = useState<boolean>(initial?.castrated ?? false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const errorId = (field: string) => `${baseId}-${field}-error`;
  const hasError = (field: string) => Boolean(errors[field]);

  function handleSave() {
    const weight = parseWeight(weightStr);
    const input: RegisterPetInput = {
      name,
      species: species as PetSpecies,
      breed,
      // PetEntity.validate accepts any value; we cast to satisfy the type.
      birthDate: birthDate as Date,
      sex: sex as PetSex,
      weight: weight as number,
      castrated,
    };

    try {
      const entity = PetEntity.validate(input);
      setErrors({});
      onSave({
        name: entity.name,
        species: entity.species,
        breed: entity.breed,
        birthDate: entity.birthDate,
        sex: entity.sex,
        weight: entity.weight,
        castrated: entity.castrated,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrors(err.fieldErrors);
        return;
      }
      throw err;
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <h2 className="text-2xl font-medium tracking-tight text-foreground">
        {isEdit ? 'Editar pet' : 'Novo pet'}
      </h2>

      {/* Espécie */}
      <div className="space-y-1.5">
        <Label>Espécie</Label>
        <div
          role="radiogroup"
          aria-describedby={hasError('species') ? errorId('species') : undefined}
          aria-invalid={hasError('species') || undefined}
          className="flex gap-2"
        >
          {SPECIES_OPTIONS.map((opt) => {
            const selected = species === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSpecies(opt.value)}
                className={cn(
                  'flex-1 inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75]',
                  selected
                    ? 'border-[#4E8C75] bg-[#4E8C75] text-white'
                    : 'border-border bg-background hover:bg-muted text-foreground',
                  hasError('species') && !selected && 'border-destructive',
                )}
              >
                <opt.Icon className="size-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
        {hasError('species') && (
          <p id={errorId('species')} className="text-sm text-destructive" role="alert">
            {errors['species']}
          </p>
        )}
      </div>

      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor={`${baseId}-name`}>Nome do pet</Label>
        <Input
          id={`${baseId}-name`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-describedby={hasError('name') ? errorId('name') : undefined}
          aria-invalid={hasError('name') || undefined}
          placeholder="Ex: Late, Mia…"
        />
        {hasError('name') && (
          <p id={errorId('name')} className="text-sm text-destructive" role="alert">
            {errors['name']}
          </p>
        )}
      </div>

      {/* Raça */}
      <div className="space-y-1.5">
        <Label htmlFor={`${baseId}-breed`}>Raça</Label>
        <Input
          id={`${baseId}-breed`}
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          aria-describedby={hasError('breed') ? errorId('breed') : undefined}
          aria-invalid={hasError('breed') || undefined}
          placeholder="Ex: Golden Retriever"
        />
        {hasError('breed') && (
          <p id={errorId('breed')} className="text-sm text-destructive" role="alert">
            {errors['breed']}
          </p>
        )}
      </div>

      {/* Idade × Sexo */}
      <div className="space-y-5">
        <div>
          <AgeInput
            id={`${baseId}-age`}
            value={birthDate}
            onChange={setBirthDate}
            error={errors['birthDate']}
          />
        </div>
        <div className="space-y-1.5">
          <Label id={`${baseId}-sex-label`}>Sexo</Label>
          <SexToggle
            id={`${baseId}-sex`}
            value={sex}
            onChange={setSex}
            error={errors['sex']}
            aria-describedby={`${baseId}-sex-label`}
          />
          {hasError('sex') && (
            <p id={errorId('sex')} className="text-sm text-destructive" role="alert">
              {errors['sex']}
            </p>
          )}
        </div>
      </div>

      {/* Peso */}
      <div className="space-y-1.5">
        <Label htmlFor={`${baseId}-weight`}>Peso (kg)</Label>
        <Input
          id={`${baseId}-weight`}
          type="text"
          inputMode="decimal"
          value={weightStr}
          onChange={(e) => setWeightStr(e.target.value)}
          aria-describedby={hasError('weight') ? errorId('weight') : undefined}
          aria-invalid={hasError('weight') || undefined}
          placeholder="Ex.: 5,2"
        />
        {hasError('weight') && (
          <p id={errorId('weight')} className="text-sm text-destructive" role="alert">
            {errors['weight']}
          </p>
        )}
      </div>

      {/* Castrado(a) */}
      <div className="space-y-1.5">
        <Label id={`${baseId}-castrated-label`}>Castrado(a)</Label>
        <div
          className={cn(
            'flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3.5',
            hasError('castrated') && 'border-destructive',
          )}
        >
          <span className="text-sm text-foreground">
            {castrated ? 'Sim, é castrado(a)' : 'Ainda não foi castrado(a)'}
          </span>
          <Switch
            checked={castrated}
            onCheckedChange={setCastrated}
            aria-labelledby={`${baseId}-castrated-label`}
            aria-describedby={hasError('castrated') ? errorId('castrated') : undefined}
            aria-invalid={hasError('castrated') || undefined}
            className="data-[state=checked]:bg-[#4E8C75] data-[state=unchecked]:bg-zinc-300"
          />
        </div>
        {hasError('castrated') && (
          <p id={errorId('castrated')} className="text-sm text-destructive" role="alert">
            {errors['castrated']}
          </p>
        )}
      </div>

      {/* Footer: cancel / save */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="flex-[1.4]"
        >
          {isEdit ? 'Salvar alterações' : 'Adicionar pet'}
        </Button>
      </div>
    </div>
  );
}
