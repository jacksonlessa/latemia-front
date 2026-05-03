'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClientHeaderCard } from '@/components/admin/clientes/organisms/client-header-card';
import { PetListSticky } from '@/components/admin/clientes/organisms/pet-list-sticky';
import { PetPlanPanel } from '@/components/admin/clientes/organisms/pet-plan-panel';
import { EditClientDrawer } from '@/components/admin/clientes/organisms/edit-client-drawer';
import { EditPetDrawer } from '@/components/admin/clientes/organisms/edit-pet-drawer';
import type { ClientDetail } from '@/lib/types/client';
import type { PlanListItem, PlanStatus } from '@/lib/types/plan';
import type { PetListItemData } from '@/components/admin/clientes/molecules/pet-list-item';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';
import type { PetDetail } from '@/lib/types/pet';

interface ClientDetailPageClientProps {
  client: ClientDetail;
  plans: PlanListItem[];
}

/** Priority order for vigente plan statuses. */
const VIGENTE_PRIORITY: PlanStatus[] = [
  'ativo',
  'carencia',
  'inadimplente',
  'pendente',
];

/**
 * Given the client's pets and all plans, select the initial pet to display.
 * Prefers the pet with the highest-priority vigente plan (matched by petId),
 * then falls back to the first pet.
 */
function selectInitialPetId(
  pets: ClientDetail['pets'],
  plans: PlanListItem[],
): string | null {
  if (pets.length === 0) return null;
  for (const status of VIGENTE_PRIORITY) {
    const plan = plans.find((p) => p.status === status);
    if (plan) {
      // Match by petId for deterministic association (pet name is non-unique per client)
      const pet = pets.find((pt) => pt.id === plan.petId);
      if (pet) return pet.id;
    }
  }
  return pets[0]?.id ?? null;
}

/**
 * Returns the plan status for a given pet (highest-priority vigente status, or
 * undefined when no vigente plan exists). Uses petId for deterministic matching.
 */
function getPetPlanStatus(
  petId: string,
  plans: PlanListItem[],
): PlanStatus | undefined {
  const petPlans = plans.filter((p) => p.petId === petId);
  for (const status of VIGENTE_PRIORITY) {
    if (petPlans.some((p) => p.status === status)) return status;
  }
  return undefined;
}

/**
 * ClientDetailPageClient — Client Component that owns:
 * - `selectedPetId` state
 * - EditClientDrawer and EditPetDrawer (wired to Task 5.0 organisms)
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

  // Lazy initializer — runs once before first render; avoids useMemo([]) anti-pattern
  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    () => selectInitialPetId(client.pets, plans),
  );
  const [clientData, setClientData] = useState<ClientDetail>(client);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [editPetOpen, setEditPetOpen] = useState(false);

  const handleSelectPet = useCallback((petId: string) => {
    setSelectedPetId(petId);
  }, []);

  const handleEditClient = useCallback(() => {
    setEditClientOpen(true);
  }, []);

  const handleEditPet = useCallback(() => {
    setEditPetOpen(true);
  }, []);

  const handleClientSaved = useCallback(
    (updated: ClientDetail) => {
      setClientData(updated);
      router.refresh();
    },
    [router],
  );

  const handlePetSaved = useCallback(
    (_updated: PetDetail) => {
      // router.refresh() re-validates Server Components to pick up the new pet data
      router.refresh();
    },
    [router],
  );

  const handleUsageRegistered = useCallback(
    (_usage: BenefitUsageResponse) => {
      // router.refresh() re-validates Server Components without full navigation.
      router.refresh();
    },
    [router],
  );

  // Build PetListItemData array with planStatus derived from the plans list
  const petListItems: PetListItemData[] = clientData.pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    birthDate: pet.birthDate,
    planStatus: getPetPlanStatus(pet.id, plans),
  }));

  const selectedPet = clientData.pets.find((p) => p.id === selectedPetId) ?? null;

  // Build PetDetail-compatible shape for the EditPetDrawer from the selected PetListItem
  const selectedPetDetail: PetDetail | null = selectedPet
    ? {
        id: selectedPet.id,
        clientId: clientData.id,
        name: selectedPet.name,
        species: selectedPet.species,
        breed: selectedPet.breed,
        birthDate: selectedPet.birthDate,
        sex: selectedPet.sex,
        weight: selectedPet.weight,
        castrated: selectedPet.castrated,
        createdAt: selectedPet.createdAt,
      }
    : null;

  return (
    <>
      {/* Client header — always visible */}
      <ClientHeaderCard client={clientData} onEditClient={handleEditClient} />

      {/* Main area: pet list + plan panel */}
      {clientData.pets.length === 0 ? (
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
        // Two-column layout from tablet (768px) onwards; single column on mobile
        <div className="flex flex-col gap-4 md:grid md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
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
                clientId={clientData.id}
                allPlans={plans}
                clientName={clientData.name}
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

      {/* Edit client drawer — wired from Task 5.0 */}
      <EditClientDrawer
        client={clientData}
        open={editClientOpen}
        onOpenChange={setEditClientOpen}
        onSaved={handleClientSaved}
      />

      {/* Edit pet drawer — wired from Task 5.0; only rendered when a pet is selected */}
      {selectedPetDetail && (
        <EditPetDrawer
          pet={selectedPetDetail}
          clientId={clientData.id}
          open={editPetOpen}
          onOpenChange={setEditPetOpen}
          onSaved={handlePetSaved}
        />
      )}
    </>
  );
}
