import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PetSpecies } from '@/lib/types/pet';
import { PET_SPECIES_LABEL } from '@/lib/pet-labels';

export interface StepSucessoProps {
  clientName: string;
  pets: Array<{ name: string; species: PetSpecies }>;
}

export function StepSucesso({ clientName, pets }: StepSucessoProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      {/* Success icon */}
      <CircleCheck
        size={64}
        className="text-[#4E8C75]"
        aria-hidden="true"
        strokeWidth={1.5}
      />

      {/* Heading */}
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-forest">Solicitação recebida!</h2>
        <p className="text-base text-foreground">
          Obrigado, <span className="font-semibold">{clientName}</span>!
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Em breve entraremos em contato para finalizar o pagamento e ativar o plano dos seus pets.
        </p>
      </div>

      {/* Pets list */}
      {pets.length > 0 && (
        <div className="w-full max-w-xs rounded-lg border border-border bg-white p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Pets contratados
          </p>
          <ul className="space-y-2" role="list">
            {pets.map((pet, index) => (
              <li
                key={`${pet.name}-${index}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium text-foreground">{pet.name}</span>
                <span className="text-muted-foreground">{PET_SPECIES_LABEL[pet.species]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Return to home */}
      <Button
        asChild
        className="bg-[#4E8C75] hover:bg-[#3d7260] text-white min-w-[180px]"
      >
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
