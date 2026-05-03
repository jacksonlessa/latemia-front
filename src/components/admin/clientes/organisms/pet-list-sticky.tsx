'use client';

import { PetListItem, type PetListItemData } from '@/components/admin/clientes/molecules/pet-list-item';
import { cn } from '@/lib/utils';

interface PetListStickyProps {
  pets: PetListItemData[];
  selectedPetId?: string;
  onSelect?: (petId: string) => void;
  className?: string;
}

export function PetListSticky({
  pets,
  selectedPetId,
  onSelect,
  className,
}: PetListStickyProps) {
  if (pets.length === 0) {
    return (
      <aside
        aria-label="Lista de pets"
        className={cn(
          'flex flex-col rounded-lg border bg-card p-4',
          'lg:sticky lg:top-4 lg:self-start',
          className,
        )}
      >
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum pet cadastrado.
        </p>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Lista de pets"
      className={cn(
        'rounded-lg border bg-card',
        // Desktop/tablet: sticky sidebar, vertical list
        'lg:sticky lg:top-4 lg:self-start',
        className,
      )}
    >
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Pets{' '}
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {pets.length}
          </span>
        </h2>
      </div>

      {/* List — vertical on desktop/tablet, horizontal on mobile */}
      <nav aria-label="Navegação entre pets">
        <ul
          className={cn(
            // Mobile: horizontal scroll
            'flex overflow-x-auto gap-2 p-3',
            // Desktop: vertical list
            'lg:flex-col lg:overflow-x-visible lg:p-2',
          )}
          role="listbox"
          aria-label="Selecione um pet"
        >
          {pets.map((pet) => (
            <li
              key={pet.id}
              role="option"
              aria-selected={pet.id === selectedPetId}
              className={cn(
                // Mobile: shrink-0 so items don't compress in horizontal scroll
                'shrink-0',
                'lg:shrink lg:w-full',
              )}
            >
              <div className="w-48 lg:w-full">
                <PetListItem
                  pet={pet}
                  selected={pet.id === selectedPetId}
                  onClick={onSelect}
                />
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
