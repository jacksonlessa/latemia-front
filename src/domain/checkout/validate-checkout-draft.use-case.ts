/**
 * ValidateCheckoutDraftUseCase
 *
 * Validates the complete checkout draft (client + all pets) and returns a
 * CheckoutSummary with the computed total price. Throws ValidationError if any
 * field is invalid — delegates to ClientEntity and PetEntity without
 * duplicating validation logic.
 *
 * Pure synchronous function — no side effects, no API calls.
 */

import { ClientEntity } from "@/domain/client/client.entity";
import { PetEntity } from "@/domain/pet/pet.entity";
import { publicSite } from "@/config/public-site";
import type { CheckoutDraft, CheckoutSummary } from "./checkout.types";

export class ValidateCheckoutDraftUseCase {
  execute(draft: CheckoutDraft): CheckoutSummary {
    ClientEntity.validate(draft.client);
    draft.pets.forEach((p) => PetEntity.validate(p));

    return {
      clientName: draft.client.name.trim(),
      pets: draft.pets.map((p) => ({ name: p.name, species: p.species })),
      pricePerPetCents: publicSite.price.perPetCents,
      totalCents: draft.pets.length * publicSite.price.perPetCents,
    };
  }
}
