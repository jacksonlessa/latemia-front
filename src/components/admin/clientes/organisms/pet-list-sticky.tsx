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
          // Desktop/tablet (≥768px): sticky; fallback top-0 (no --admin-topbar-height variable defined)
          'md:sticky md:top-0 md:self-start',
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
        // Desktop/tablet (≥768px): sticky sidebar
        // top falls back to 0 since --admin-topbar-height is not defined globally
        'md:sticky md:top-0 md:self-start',
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

      {/*
       * List — vertical on desktop/tablet, horizontal scroll on mobile.
       *
       * ARIA: The container is a nav with an accessible label. Individual items
       * use PetListItem which renders a <button aria-pressed> — the correct
       * pattern for toggle buttons that select content. We do NOT use
       * role="listbox"/"option" here because the `option` role must not contain
       * interactive children (buttons), which would be an ARIA invalid nesting.
       */}
      <nav aria-label="Navegação entre pets">
        <ul
          className={cn(
            // Mobile (<768px): horizontal scroll so all pets are reachable
            'flex overflow-x-auto gap-2 p-3',
            // Desktop/tablet (≥768px): vertical list, no horizontal scroll
            'md:flex-col md:overflow-x-visible md:p-2',
          )}
        >
          {pets.map((pet) => (
            <li
              key={pet.id}
              className={cn(
                // Mobile: fixed width so cards don't collapse in flex row
                'shrink-0',
                'md:shrink md:w-full',
              )}
            >
              <div className="w-48 md:w-full">
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
