'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ClientHeaderCard } from '@/components/admin/clientes/organisms/client-header-card';
import { PetListSticky } from '@/components/admin/clientes/organisms/pet-list-sticky';
import { PetPlanPanel } from '@/components/admin/clientes/organisms/pet-plan-panel';
import { EditClientDrawer } from '@/components/admin/clientes/organisms/edit-client-drawer';
import { EditPetDrawer } from '@/components/admin/clientes/organisms/edit-pet-drawer';
import { PaymentUpdateLinkSection } from '@/components/admin/clientes/organisms/payment-update-link-section';
import { AddPetToClientDialog } from '@/components/admin/clientes/organisms/add-pet-to-client-dialog';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TERMINAL_PLAN_STATUSES } from '@/lib/types/plan';
import type { ClientDetail } from '@/lib/types/client';
import type { PlanListItem, PlanStatus } from '@/lib/types/plan';
import type { PetListItemData } from '@/components/admin/clientes/molecules/pet-list-item';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';
import type { PetDetail, AddPetToClientResult } from '@/lib/types/pet';

interface ClientDetailPageClientProps {
  client: ClientDetail;
  plans: PlanListItem[];
  /** Current subscription price per pet, in cents. Defaults to 0 when omitted (e.g. legacy tests). */
  pricePerPetCents?: number;
  /**
   * Additional-pet contract text shown in `AddPetToClientDialog`'s
   * confirmation step. Defaults to an empty string, which the dialog
   * replaces with a generic placeholder.
   */
  petAdditionContractText?: string;
}

// ---------------------------------------------------------------------------
// AddPetButton — visibility/enablement decided by the parent, mirroring the
// pattern already used by `PaymentUpdateLinkSection`.
// ---------------------------------------------------------------------------

const BLOCKED_TOOLTIP_MESSAGES: Record<string, string> = {
  client_inadimplente:
    'Cliente com cobrança em aberto. Use o link de atualização de pagamento primeiro.',
  client_pendente:
    'Aguarde a primeira cobrança ser confirmada antes de adicionar pets.',
};

interface AddPetButtonProps {
  eligible: boolean | undefined;
  blockedReason: string | null | undefined;
  onClick: () => void;
}

function AddPetButton({ eligible, blockedReason, onClick }: AddPetButtonProps) {
  if (eligible === false) {
    const tooltipMessage = blockedReason
      ? (BLOCKED_TOOLTIP_MESSAGES[blockedReason] ??
        'Cliente não elegível para adição de pet no momento.')
      : 'Cliente não elegível para adição de pet no momento.';

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Wrapped in a focusable <span> so the tooltip works on a disabled button. */}
          <span tabIndex={0} className="inline-block">
            <Button type="button" disabled aria-disabled="true">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Adicionar pet
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent role="tooltip">{tooltipMessage}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button type="button" onClick={onClick}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Adicionar pet
    </Button>
  );
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
  pricePerPetCents = 0,
  petAdditionContractText = '',
}: ClientDetailPageClientProps) {
  const router = useRouter();

  // Lazy initializer — runs once before first render; avoids useMemo([]) anti-pattern
  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    () => selectInitialPetId(client.pets, plans),
  );
  const [clientData, setClientData] = useState<ClientDetail>(client);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [editPetOpen, setEditPetOpen] = useState(false);
  const [addPetOpen, setAddPetOpen] = useState(false);

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

  const handlePetDeactivated = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleAddPet = useCallback(() => {
    setAddPetOpen(true);
  }, []);

  const handlePetAdded = useCallback(
    (_result: AddPetToClientResult) => {
      // router.refresh() re-validates Server Components to pick up the new
      // pet + its `pendente` plan.
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

  // Pets with live (non-terminal) plans — shown in payment update tooltip
  const petsWithLivePlans = clientData.pets
    .filter((pet) =>
      plans.some(
        (p) =>
          p.petId === pet.id &&
          !['cancelado', 'estornado', 'contestado'].includes(p.status),
      ),
    )
    .map((pet) => pet.name);

  // Count of live (non-terminal) plans — used by AddPetToClientDialog to
  // compute the local financial preview `(currentLivePlanCount + 1) × price`.
  const currentLivePlanCount = plans.filter(
    (p) => !TERMINAL_PLAN_STATUSES.has(p.status),
  ).length;

  return (
    <>
      {/* Client header — always visible */}
      <ClientHeaderCard client={clientData} onEditClient={handleEditClient} />

      {/* Payment update link — visible only when client has an active subscription and eligible plans */}
      {clientData.pagarmeSubscriptionId && clientData.paymentUpdateEligible ? (
        <PaymentUpdateLinkSection
          clientId={clientData.id}
          currentToken={clientData.paymentUpdateToken ?? null}
          petsCovered={petsWithLivePlans}
        />
      ) : null}

      {/* Add pet — hidden without an active subscription; disabled+tooltip when blocked */}
      {clientData.pagarmeSubscriptionId ? (
        <div className="flex justify-end">
          <AddPetButton
            eligible={clientData.petAdditionEligible}
            blockedReason={clientData.petAdditionBlockedReason}
            onClick={handleAddPet}
          />
        </div>
      ) : null}

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
                onDeactivated={handlePetDeactivated}
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

      {/* Add pet dialog — Tarefa 7.0 (adicao-pet-cliente-existente) */}
      <AddPetToClientDialog
        clientId={clientData.id}
        open={addPetOpen}
        onOpenChange={setAddPetOpen}
        onAdded={handlePetAdded}
        currentLivePlanCount={currentLivePlanCount}
        pricePerPetCents={pricePerPetCents}
        contractText={petAdditionContractText}
      />
    </>
  );
}
