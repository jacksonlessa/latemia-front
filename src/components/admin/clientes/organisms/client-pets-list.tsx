import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PetSpeciesBadge } from '@/components/admin/clientes/atoms/pet-species-badge';
import type { PetListItem } from '@/lib/types/client';

interface ClientPetsListProps {
  pets: PetListItem[];
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});

function formatDate(iso: string): string {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return '—';
  }
}

function formatWeight(weight: number): string {
  return `${weight.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
}

export function ClientPetsList({ pets }: ClientPetsListProps) {
  if (pets.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#6B6B6E]">
        Nenhum pet cadastrado para este cliente.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Nome</TableHead>
            <TableHead scope="col">Espécie</TableHead>
            <TableHead scope="col">Raça</TableHead>
            <TableHead scope="col">Data de nascimento</TableHead>
            <TableHead scope="col">Peso</TableHead>
            <TableHead scope="col">Castrado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pets.map((pet) => (
            <TableRow key={pet.id}>
              <TableCell className="font-medium">{pet.name}</TableCell>
              <TableCell>
                <PetSpeciesBadge species={pet.species} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {pet.breed}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(pet.birthDate)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatWeight(pet.weight)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {pet.castrated ? 'Sim' : 'Não'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
