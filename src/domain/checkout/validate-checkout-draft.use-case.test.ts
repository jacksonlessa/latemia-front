/**
 * Unit tests for ValidateCheckoutDraftUseCase.
 *
 * Pure domain logic — no network or DB calls.
 */

import { describe, it, expect } from "vitest";
import { ValidateCheckoutDraftUseCase } from "./validate-checkout-draft.use-case";
import { ValidationError } from "@/lib/validation-error";
import type { CheckoutDraft } from "./checkout.types";
import type { RegisterClientInput } from "@/lib/types/client";
import type { RegisterPetInput } from "@/lib/types/pet";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validAddress = {
  cep: "01310-100",
  street: "Avenida Paulista",
  number: "1000",
  city: "São Paulo",
  state: "SP",
};

function validClient(overrides: Partial<RegisterClientInput> = {}): RegisterClientInput {
  return {
    name: "Maria da Silva",
    cpf: "529.982.247-25",
    phone: "11987654321",
    email: "maria@example.com",
    address: validAddress,
    ...overrides,
  };
}

function validPet(overrides: Partial<RegisterPetInput> = {}): RegisterPetInput {
  // Birth date ~3 years ago — well within the 30-year window enforced by PetEntity.
  const birthDate = new Date();
  birthDate.setFullYear(birthDate.getFullYear() - 3);
  return {
    name: "Rex",
    species: "canino",
    breed: "Labrador",
    birthDate,
    sex: "male",
    weight: 28.5,
    castrated: true,
    ...overrides,
  };
}

function validDraft(overrides: Partial<CheckoutDraft> = {}): CheckoutDraft {
  return {
    client: validClient(),
    pets: [validPet()],
    contractAcceptedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ValidateCheckoutDraftUseCase", () => {
  it("should return summary when client and all pets are valid", () => {
    const useCase = new ValidateCheckoutDraftUseCase();
    const summary = useCase.execute(validDraft());

    expect(summary.clientName).toBe("Maria da Silva");
    expect(summary.pets).toHaveLength(1);
    expect(summary.pets[0]).toEqual({ name: "Rex", species: "canino" });
    expect(summary.pricePerPetCents).toBe(2500);
    expect(summary.totalCents).toBe(2500);
  });

  it("should throw ValidationError when client name is empty", () => {
    const useCase = new ValidateCheckoutDraftUseCase();
    const draft = validDraft({ client: validClient({ name: "" }) });

    expect(() => useCase.execute(draft)).toThrow(ValidationError);

    try {
      useCase.execute(draft);
    } catch (e) {
      expect((e as ValidationError).fieldErrors["name"]).toBeDefined();
    }
  });

  it("should throw ValidationError when any pet has invalid species", () => {
    const useCase = new ValidateCheckoutDraftUseCase();
    const draft = validDraft({
      pets: [validPet({ species: "reptil" as "canino" })],
    });

    expect(() => useCase.execute(draft)).toThrow(ValidationError);

    try {
      useCase.execute(draft);
    } catch (e) {
      expect((e as ValidationError).fieldErrors["species"]).toBeDefined();
    }
  });

  it("should calculate totalCents as pets.length × pricePerPetCents", () => {
    const useCase = new ValidateCheckoutDraftUseCase();
    const pets = [
      validPet({ name: "Rex" }),
      validPet({ name: "Luna", species: "felino" }),
      validPet({ name: "Buddy" }),
    ];
    const summary = useCase.execute(validDraft({ pets }));

    expect(summary.pricePerPetCents).toBe(2500);
    expect(summary.totalCents).toBe(pets.length * 2500);
    expect(summary.totalCents).toBe(7500);
  });
});
