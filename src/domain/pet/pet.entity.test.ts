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

function buildBirthDate(yearsAgo: number, monthsAgo = 0): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  d.setMonth(d.getMonth() - monthsAgo);
  return d;
}

function validInput(overrides: Partial<RegisterPetInput> = {}): RegisterPetInput {
  return {
    name: "Rex",
    species: "canino",
    breed: "Labrador",
    birthDate: buildBirthDate(3, 6),
    sex: "male",
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
    expect(entity.sex).toBe("male");
  });

  it("should trim the pet name", () => {
    const entity = PetEntity.validate(validInput({ name: "  Rex  " }));
    expect(entity.name).toBe("Rex");
  });

  it("should trim the breed", () => {
    const entity = PetEntity.validate(validInput({ breed: "  Labrador  " }));
    expect(entity.breed).toBe("Labrador");
  });

  it("should accept castrated = false", () => {
    const entity = PetEntity.validate(validInput({ castrated: false }));
    expect(entity.castrated).toBe(false);
  });

  it("should accept felino species", () => {
    const entity = PetEntity.validate(validInput({ species: "felino" }));
    expect(entity.species).toBe("felino");
  });

  it("should accept sex = female", () => {
    const entity = PetEntity.validate(validInput({ sex: "female" }));
    expect(entity.sex).toBe("female");
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
// birthDate validation
// ---------------------------------------------------------------------------

describe("PetEntity.validate — birthDate", () => {
  it("should throw ValidationError with birthDate error when value is not a Date", () => {
    try {
      PetEntity.validate(
        validInput({ birthDate: "2020-01-01" as unknown as Date }),
      );
    } catch (e) {
      expect((e as ValidationError).fieldErrors["birthDate"]).toBeDefined();
    }
  });

  it("should throw ValidationError with birthDate error when Date is invalid (NaN)", () => {
    try {
      PetEntity.validate(validInput({ birthDate: new Date("not-a-date") }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["birthDate"]).toBeDefined();
    }
  });

  it("should throw ValidationError with birthDate error when date is in the future", () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    try {
      PetEntity.validate(validInput({ birthDate: future }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["birthDate"]).toBeDefined();
    }
  });

  it("should throw ValidationError with birthDate error when date is more than 30 years ago", () => {
    const tooOld = new Date();
    tooOld.setFullYear(tooOld.getFullYear() - 31);
    try {
      PetEntity.validate(validInput({ birthDate: tooOld }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["birthDate"]).toBeDefined();
    }
  });

  it("should accept a birthDate within the last 30 years", () => {
    const withinRange = new Date();
    withinRange.setFullYear(withinRange.getFullYear() - 29);
    const entity = PetEntity.validate(validInput({ birthDate: withinRange }));
    expect(entity.birthDate.getTime()).toBe(withinRange.getTime());
  });
});

// ---------------------------------------------------------------------------
// sex validation
// ---------------------------------------------------------------------------

describe("PetEntity.validate — sex", () => {
  it("should throw ValidationError with sex error when sex is missing", () => {
    try {
      PetEntity.validate(
        validInput({ sex: undefined as unknown as "male" }),
      );
    } catch (e) {
      expect((e as ValidationError).fieldErrors["sex"]).toBeDefined();
    }
  });

  it("should throw ValidationError with sex error when sex is invalid", () => {
    try {
      PetEntity.validate(
        validInput({ sex: "other" as unknown as "male" }),
      );
    } catch (e) {
      expect((e as ValidationError).fieldErrors["sex"]).toBeDefined();
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

  it("should throw ValidationError with weight error when weight < 0.1", () => {
    try {
      PetEntity.validate(validInput({ weight: 0.05 }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["weight"]).toBeDefined();
    }
  });

  it("should throw ValidationError with weight error when weight > 100", () => {
    try {
      PetEntity.validate(validInput({ weight: 100.1 }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["weight"]).toBeDefined();
    }
  });

  it("should accept weight = 0.1 (lower bound)", () => {
    const entity = PetEntity.validate(validInput({ weight: 0.1 }));
    expect(entity.weight).toBe(0.1);
  });

  it("should accept weight = 100 (upper bound)", () => {
    const entity = PetEntity.validate(validInput({ weight: 100 }));
    expect(entity.weight).toBe(100);
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
    const birthDate = buildBirthDate(3, 6);
    const entity = PetEntity.validate(validInput({ birthDate }));
    const payload = entity.toApiPayload();

    expect(payload).toMatchObject({
      name: "Rex",
      species: "canino",
      breed: "Labrador",
      sex: "male",
      weight: 28.5,
      castrated: true,
    });
    expect(payload.birthDate).toBe(birthDate.toISOString());
  });

  it("should emit birthDate as an ISO 8601 string", () => {
    const birthDate = new Date("2020-05-10T00:00:00.000Z");
    const entity = PetEntity.validate(validInput({ birthDate }));
    const payload = entity.toApiPayload();

    expect(payload.birthDate).toBe("2020-05-10T00:00:00.000Z");
  });
});
