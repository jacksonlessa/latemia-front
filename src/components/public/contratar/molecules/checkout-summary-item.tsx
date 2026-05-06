import type { PetSpecies } from '@/lib/types/pet';
import { formatBRL } from '@/lib/currency';
import { PET_SPECIES_LABEL } from '@/lib/pet-labels';

export interface CheckoutSummaryItemProps {
  petName: string;
  species: PetSpecies;
  pricePerPetCents: number;
}

export function CheckoutSummaryItem({
  petName,
  species,
  pricePerPetCents,
}: CheckoutSummaryItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{petName}</span>
        <span className="text-xs text-muted-foreground">{PET_SPECIES_LABEL[species]}</span>
      </div>
      <span className="text-sm font-medium text-foreground tabular-nums">
        {formatBRL(pricePerPetCents)}
      </span>
    </div>
  );
}
