'use client';

import type { PetSpecies } from '@/lib/types/pet';

interface SpeciesSelectProps {
  id?: string;
  name?: string;
  value: PetSpecies | '';
  onChange: (value: PetSpecies | '') => void;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/**
 * Accessible species select for the pet registration form.
 * Uses a native <select> element for maximum accessibility.
 */
export function SpeciesSelect({
  id,
  name,
  value,
  onChange,
  disabled,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
}: SpeciesSelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value as PetSpecies | '')}
      disabled={disabled}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="">Selecione a espécie</option>
      <option value="canino">Canino</option>
      <option value="felino">Felino</option>
    </select>
  );
}
