/**
 * ValidateCheckoutDraftUseCase
 *
 * Validates the complete checkout draft (client + all pets) and returns a
 * CheckoutSummary with the computed total price. Throws ValidationError if any
 * field is invalid — delegates to ClientEntity and PetEntity without
 * duplicating validation logic.
 *
 * Pure synchronous function — no side effects, no API calls. The price per pet
 * is injected by the caller so the use-case stays decoupled from the global
 * `publicSite` config and reflects the live backend value (loaded via
 * `getPublicConfig`).
 */

import { ClientEntity } from "@/domain/client/client.entity";
import { PetEntity } from "@/domain/pet/pet.entity";
import type { CheckoutDraft, CheckoutSummary } from "./checkout.types";

export interface ValidateCheckoutDraftOptions {
  /** Per-pet monthly price in cents — single source of truth comes from `getPublicConfig`. */
  pricePerPetCents: number;
}

export class ValidateCheckoutDraftUseCase {
  execute(
    draft: CheckoutDraft,
    options: ValidateCheckoutDraftOptions,
  ): CheckoutSummary {
    ClientEntity.validate(draft.client);
    draft.pets.forEach((p) => PetEntity.validate(p));

    return {
      clientName: draft.client.name.trim(),
      pets: draft.pets.map((p) => ({ name: p.name, species: p.species })),
      pricePerPetCents: options.pricePerPetCents,
      totalCents: draft.pets.length * options.pricePerPetCents,
    };
  }
}
