'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ClientHeaderCard } from '@/components/admin/clientes/organisms/client-header-card';
import {
  PetListSticky,
} from '@/components/admin/clientes/organisms/pet-list-sticky';
import { PetPlanPanel } from '@/components/admin/clientes/organisms/pet-plan-panel';
import type { ClientDetail } from '@/lib/types/client';
import type { PlanListItem, PlanStatus } from '@/lib/types/plan';
import type { PetListItemData } from '@/components/admin/clientes/molecules/pet-list-item';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientDetailPageClientProps {
  client: ClientDetail;
  plans: PlanListItem[];
  // Optional: EditClientDrawer — Task 5.0 placeholder (not yet implemented)
  // onEditClient?: () => void
}

// ---------------------------------------------------------------------------
// Heuristic: pick the best initial pet
// ---------------------------------------------------------------------------

/** Priority order for vigente plan statuses. */
const VIGENTE_PRIORITY: PlanStatus[] = [
  'ativo',
  'carencia',
  'inadimplente',
  'pendente',
];

/**
 * Given the client's pets and all plans, select the initial pet to display.
 * Prefers the pet with the highest-priority vigente plan, then falls back to
 * the first pet.
 */
function selectInitialPetId(
  pets: ClientDetail['pets'],
  plans: PlanListItem[],
): string | null {
  if (pets.length === 0) return null;

  for (const status of VIGENTE_PRIORITY) {
    const plan = plans.find((p) => p.status === status);
    if (plan) {
      // Find the pet whose name matches this plan's petName
      const pet = pets.find((pt) => pt.name === plan.petName);
      if (pet) return pet.id;
    }
  }

  return pets[0]?.id ?? null;
}

/**
 * Returns the plan status for a given pet (highest-priority vigente status, or
 * undefined when no vigente plan exists).
 */
function getPetPlanStatus(
  petName: string,
  plans: PlanListItem[],
): PlanStatus | undefined {
  const petPlans = plans.filter((p) => p.petName === petName);
  for (const status of VIGENTE_PRIORITY) {
    if (petPlans.some((p) => p.status === status)) return status;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ClientDetailPageClient — Client Component that owns:
 * - `selectedPetId` state
 * - Slots for EditClientDrawer and EditPetDrawer (Task 5.0 placeholders)
 * - `router.refresh()` after mutations
 *
 * Renders the two-column layout:
 * - Left: PetListSticky
 * - Right: PetPlanPanel (or no-pets message)
 */
export function ClientDetailPageClient({
  client,
  plans,
}: ClientDetailPageClientProps) {
  const router = useRouter();

  const initialPetId = useMemo(
    () => selectInitialPetId(client.pets, plans),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    initialPetId,
  );

  // Placeholder: open state for drawers (Task 5.0)
  // const [editClientOpen, setEditClientOpen] = useState(false);
  // const [editPetOpen, setEditPetOpen] = useState(false);

  const handleSelectPet = useCallback((petId: string) => {
    setSelectedPetId(petId);
  }, []);

  const handleEditClient = useCallback(() => {
    // TODO (Task 5.0): setEditClientOpen(true)
    // Placeholder: no-op until EditClientDrawer is implemented
  }, []);

  const handleEditPet = useCallback(() => {
    // TODO (Task 5.0): setEditPetOpen(true)
    // Placeholder: no-op until EditPetDrawer is implemented
  }, []);

  const handleUsageRegistered = useCallback(
    (_usage: BenefitUsageResponse) => {
      // router.refresh() re-validates Server Components without full navigation.
      // This is acceptable for now; local optimistic update happens in PetPlanPanel.
      router.refresh();
    },
    [router],
  );

  // Build PetListItemData array with planStatus derived from the plans list
  const petListItems: PetListItemData[] = client.pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    birthDate: pet.birthDate,
    planStatus: getPetPlanStatus(pet.name, plans),
  }));

  const selectedPet = client.pets.find((p) => p.id === selectedPetId) ?? null;

  return (
    <>
      {/* Client header — always visible */}
      <ClientHeaderCard client={client} onEditClient={handleEditClient} />

      {/* Main area: pet list + plan panel */}
      {client.pets.length === 0 ? (
        // Empty state — no pets
        <div
          className="rounded-lg border bg-muted/30 px-4 py-10 text-center"
          data-testid="no-pets-message"
        >
          <p className="text-sm text-muted-foreground">
            Este cliente ainda não possui pets cadastrados.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[280px_1fr]">
          {/* Left: sticky pet list */}
          <PetListSticky
            pets={petListItems}
            selectedPetId={selectedPetId ?? undefined}
            onSelect={handleSelectPet}
          />

          {/* Right: plan panel for selected pet */}
          <div className="min-w-0" data-testid="plan-panel-container">
            {selectedPet ? (
              <PetPlanPanel
                pet={selectedPet}
                allPlans={plans}
                clientName={client.name}
                onUsageRegistered={handleUsageRegistered}
                onEditPet={handleEditPet}
              />
            ) : (
              <div className="rounded-lg border bg-muted/30 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Selecione um pet para ver os detalhes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/*
        Task 5.0 placeholders:
        <EditClientDrawer
          open={editClientOpen}
          onOpenChange={setEditClientOpen}
          client={client}
          onSuccess={() => { setEditClientOpen(false); router.refresh(); }}
        />
        <EditPetDrawer
          open={editPetOpen}
          onOpenChange={setEditPetOpen}
          pet={selectedPet}
          clientId={client.id}
          onSuccess={() => { setEditPetOpen(false); router.refresh(); }}
        />
      */}
    </>
  );
}
