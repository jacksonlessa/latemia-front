/**
 * Types for the checkout domain.
 *
 * CheckoutDraft holds raw user input collected across all wizard steps.
 * CheckoutSummary is the validated, normalised view returned by
 * ValidateCheckoutDraftUseCase — safe to display and eventually submit to the API.
 */

import type { RegisterClientInput } from "@/lib/types/client";
import type { RegisterPetInput, PetSpecies } from "@/lib/types/pet";

export interface CheckoutDraft {
  client: RegisterClientInput;
  pets: RegisterPetInput[];
  /** ISO timestamp recorded when the user ticks the contract acceptance checkbox. */
  contractAcceptedAt: string;
}

export interface CheckoutSummary {
  clientName: string;
  pets: Array<{ name: string; species: PetSpecies }>;
  pricePerPetCents: number;
  totalCents: number;
}
