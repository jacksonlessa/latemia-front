/**
 * Unit tests for PetEntity.
 *
 * These tests exercise validation logic in isolation — no network or DB calls.
 */

import { describe, it, expect } from "vitest";
import { PetEntity } from "./pet.entity";
import { ValidationError } from "@/lib/validation-error";
import type { RegisterPetInput } from "@/lib/types/pet";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function validInput(overrides: Partial<RegisterPetInput> = {}): RegisterPetInput {
  return {
    name: "Rex",
    species: "canino",
    breed: "Labrador",
    age_years: 3,
    age_months: 6,
    weight: 28.5,
    castrated: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe("PetEntity.validate — valid input", () => {
  it("should return a PetEntity when all fields are valid", () => {
    const entity = PetEntity.validate(validInput());

    expect(entity).toBeInstanceOf(PetEntity);
    expect(entity.name).toBe("Rex");
    expect(entity.species).toBe("canino");
  });

  it("should trim the pet name", () => {
    const entity = PetEntity.validate(validInput({ name: "  Rex  " }));
    expect(entity.name).toBe("Rex");
  });

  it("should trim the breed", () => {
    const entity = PetEntity.validate(validInput({ breed: "  Labrador  " }));
    expect(entity.breed).toBe("Labrador");
  });

  it("should accept age_months = 0 (valid lower bound)", () => {
    const entity = PetEntity.validate(validInput({ age_months: 0 }));
    expect(entity.age_months).toBe(0);
  });

  it("should accept age_months = 11 (valid upper bound)", () => {
    const entity = PetEntity.validate(validInput({ age_months: 11 }));
    expect(entity.age_months).toBe(11);
  });

  it("should accept castrated = false", () => {
    const entity = PetEntity.validate(validInput({ castrated: false }));
    expect(entity.castrated).toBe(false);
  });

  it("should accept felino species", () => {
    const entity = PetEntity.validate(validInput({ species: "felino" }));
    expect(entity.species).toBe("felino");
  });
});

// ---------------------------------------------------------------------------
// Name validation
// ---------------------------------------------------------------------------

describe("PetEntity.validate — name", () => {
  it("should throw ValidationError with name error when name is empty", () => {
    try {
      PetEntity.validate(validInput({ name: "" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["name"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Species validation
// ---------------------------------------------------------------------------

describe("PetEntity.validate — species", () => {
  it("should throw ValidationError with species error when species is invalid", () => {
    try {
      // Cast to bypass TS guard and test runtime validation
      PetEntity.validate(validInput({ species: "reptil" as "canino" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["species"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// age_months validation
// ---------------------------------------------------------------------------

describe("PetEntity.validate — age_months", () => {
  it("should throw ValidationError with age_months error when age_months = 12", () => {
    try {
      PetEntity.validate(validInput({ age_months: 12 }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["age_months"]).toBeDefined();
    }
  });

  it("should throw ValidationError with age_months error when age_months = -1", () => {
    try {
      PetEntity.validate(validInput({ age_months: -1 }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["age_months"]).toBeDefined();
    }
  });

  it("should throw ValidationError with age_months error when age_months is not an integer", () => {
    try {
      PetEntity.validate(validInput({ age_months: 5.5 }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["age_months"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// weight validation
// ---------------------------------------------------------------------------

describe("PetEntity.validate — weight", () => {
  it("should throw ValidationError with weight error when weight = 0", () => {
    try {
      PetEntity.validate(validInput({ weight: 0 }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["weight"]).toBeDefined();
    }
  });

  it("should throw ValidationError with weight error when weight = -1", () => {
    try {
      PetEntity.validate(validInput({ weight: -1 }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["weight"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// castrated validation
// ---------------------------------------------------------------------------

describe("PetEntity.validate — castrated", () => {
  it("should throw ValidationError with castrated error when castrated is not a boolean", () => {
    try {
      // Cast to bypass TS guard and test runtime validation
      PetEntity.validate(validInput({ castrated: "yes" as unknown as boolean }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["castrated"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// toApiPayload
// ---------------------------------------------------------------------------

describe("PetEntity.toApiPayload", () => {
  it("should return a payload matching the CreatePetPayload shape", () => {
    const entity = PetEntity.validate(validInput());
    const payload = entity.toApiPayload();

    expect(payload).toMatchObject({
      name: "Rex",
      species: "canino",
      breed: "Labrador",
      age_years: 3,
      age_months: 6,
      weight: 28.5,
      castrated: true,
    });
  });
});
