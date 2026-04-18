'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { RegisterPetInput, PetSpecies } from '@/lib/types/pet';

export interface PetCardProps {
  index: number;
  data: Partial<RegisterPetInput>;
  errors: Record<string, string>;
  onChange: (field: keyof RegisterPetInput, value: unknown) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function ToggleGroup({
  options,
  value,
  onChange,
  errorId,
  hasError,
}: {
  options: { label: string; value: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
  errorId?: string;
  hasError?: boolean;
}) {
  return (
    <div
      role="group"
      className="flex gap-2"
      aria-describedby={errorId}
      aria-invalid={hasError || undefined}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75]',
              selected
                ? 'border-[#4E8C75] bg-[#4E8C75] text-white'
                : 'border-border bg-background hover:bg-muted text-foreground',
              hasError && !selected && 'border-destructive',
            )}
            aria-pressed={selected}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function PetCard({ index, data, errors, onChange, onRemove, canRemove }: PetCardProps) {
  const fieldId = (field: string) => `pet-${index}-${field}`;
  const errorId = (field: string) => `pet-${index}-${field}-error`;
  const hasError = (field: string) => !!errors[field];

  const speciesOptions: { label: string; value: PetSpecies }[] = [
    { label: 'Canino', value: 'canino' },
    { label: 'Felino', value: 'felino' },
  ];

  const castratoOptions = [
    { label: 'Sim', value: 'true' },
    { label: 'Não', value: 'false' },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-5 space-y-4">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Pet {index + 1}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Remover pet ${index + 1}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      {/* Espécie */}
      <div className="space-y-1.5">
        <Label>Espécie</Label>
        <ToggleGroup
          options={speciesOptions}
          value={data.species}
          onChange={(v) => onChange('species', v as PetSpecies)}
          errorId={hasError('species') ? errorId('species') : undefined}
          hasError={hasError('species')}
        />
        {hasError('species') && (
          <p id={errorId('species')} className="text-sm text-destructive" role="alert">
            {errors['species']}
          </p>
        )}
      </div>

      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor={fieldId('name')}>Nome do pet</Label>
        <Input
          id={fieldId('name')}
          type="text"
          value={data.name ?? ''}
          onChange={(e) => onChange('name', e.target.value)}
          aria-describedby={hasError('name') ? errorId('name') : undefined}
          aria-invalid={hasError('name') || undefined}
          placeholder="Ex: Rex"
        />
        {hasError('name') && (
          <p id={errorId('name')} className="text-sm text-destructive" role="alert">
            {errors['name']}
          </p>
        )}
      </div>

      {/* Raça */}
      <div className="space-y-1.5">
        <Label htmlFor={fieldId('breed')}>Raça</Label>
        <Input
          id={fieldId('breed')}
          type="text"
          value={data.breed ?? ''}
          onChange={(e) => onChange('breed', e.target.value)}
          aria-describedby={hasError('breed') ? errorId('breed') : undefined}
          aria-invalid={hasError('breed') || undefined}
          placeholder="Ex: Labrador"
        />
        {hasError('breed') && (
          <p id={errorId('breed')} className="text-sm text-destructive" role="alert">
            {errors['breed']}
          </p>
        )}
      </div>

      {/* Idade e Peso — linha */}
      <div className="grid grid-cols-2 gap-4">
        {/* Idade em anos */}
        <div className="space-y-1.5">
          <Label htmlFor={fieldId('age_years')}>Idade (anos)</Label>
          <Input
            id={fieldId('age_years')}
            type="number"
            min={0}
            step={1}
            value={data.age_years ?? ''}
            onChange={(e) => onChange('age_years', e.target.valueAsNumber)}
            aria-describedby={hasError('age_years') ? errorId('age_years') : undefined}
            aria-invalid={hasError('age_years') || undefined}
            placeholder="0"
          />
          {hasError('age_years') && (
            <p id={errorId('age_years')} className="text-sm text-destructive" role="alert">
              {errors['age_years']}
            </p>
          )}
        </div>

        {/* Peso em kg */}
        <div className="space-y-1.5">
          <Label htmlFor={fieldId('weight')}>Peso (kg)</Label>
          <Input
            id={fieldId('weight')}
            type="number"
            min={0.1}
            step={0.1}
            value={data.weight ?? ''}
            onChange={(e) => onChange('weight', e.target.valueAsNumber)}
            aria-describedby={hasError('weight') ? errorId('weight') : undefined}
            aria-invalid={hasError('weight') || undefined}
            placeholder="5.0"
          />
          {hasError('weight') && (
            <p id={errorId('weight')} className="text-sm text-destructive" role="alert">
              {errors['weight']}
            </p>
          )}
        </div>
      </div>

      {/* Castrado */}
      <div className="space-y-1.5">
        <Label>Castrado(a)?</Label>
        <ToggleGroup
          options={castratoOptions}
          value={data.castrated === undefined ? undefined : String(data.castrated)}
          onChange={(v) => onChange('castrated', v === 'true')}
          errorId={hasError('castrated') ? errorId('castrated') : undefined}
          hasError={hasError('castrated')}
        />
        {hasError('castrated') && (
          <p id={errorId('castrated')} className="text-sm text-destructive" role="alert">
            {errors['castrated']}
          </p>
        )}
      </div>
    </div>
  );
}
