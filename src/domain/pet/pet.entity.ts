/**
 * Pet domain entity.
 *
 * Validates input before sending to the API.
 * Throws ValidationError (with per-field errors) for invalid input.
 * No personal data is included in error messages.
 */

import type { CreatePetPayload, PetSpecies, RegisterPetInput } from "@/lib/types/pet";
import { ValidationError } from "@/lib/validation-error";

// Re-export ValidationError so callers can import from either entity file.
export { ValidationError };

const VALID_SPECIES: ReadonlySet<string> = new Set<PetSpecies>([
  "canino",
  "felino",
]);

// ---------------------------------------------------------------------------
// PetEntity
// ---------------------------------------------------------------------------

export class PetEntity {
  private constructor(
    public readonly name: string,
    public readonly species: PetSpecies,
    public readonly breed: string,
    /** Full years of life (>= 0). */
    public readonly age_years: number,
    /** Months in the current year (0–11). */
    public readonly age_months: number,
    /** Weight in kg, > 0. */
    public readonly weight: number,
    public readonly castrated: boolean,
  ) {}

  /**
   * Validates the raw input and returns a PetEntity on success.
   * Throws ValidationError with per-field errors on failure.
   *
   * @param input - Raw user input from the pet registration form.
   */
  static validate(input: RegisterPetInput): PetEntity {
    const errors: Record<string, string> = {};

    // Name
    if (!input.name?.trim()) {
      errors["name"] = "Nome é obrigatório";
    }

    // Species
    if (!input.species || !VALID_SPECIES.has(input.species)) {
      errors["species"] = "Espécie inválida (canino ou felino)";
    }

    // Breed
    if (!input.breed?.trim()) {
      errors["breed"] = "Raça é obrigatória";
    }

    // age_years
    if (
      input.age_years === undefined ||
      input.age_years === null ||
      !Number.isInteger(input.age_years) ||
      input.age_years < 0
    ) {
      errors["age_years"] = "Anos de vida inválidos";
    }

    // age_months — must be 0..11
    if (
      input.age_months === undefined ||
      input.age_months === null ||
      !Number.isInteger(input.age_months) ||
      input.age_months < 0 ||
      input.age_months > 11
    ) {
      errors["age_months"] = "Meses de vida inválidos (0 a 11)";
    }

    // weight — must be > 0
    if (
      input.weight === undefined ||
      input.weight === null ||
      typeof input.weight !== "number" ||
      input.weight <= 0
    ) {
      errors["weight"] = "Peso deve ser maior que zero";
    }

    // castrated — must be a boolean
    if (typeof input.castrated !== "boolean") {
      errors["castrated"] = "Status de castração é obrigatório";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return new PetEntity(
      input.name.trim(),
      input.species,
      input.breed.trim(),
      input.age_years,
      input.age_months,
      input.weight,
      input.castrated,
    );
  }

  /** Returns the payload to be sent to POST /v1/register/pet. */
  toApiPayload(): CreatePetPayload {
    return {
      name: this.name,
      species: this.species,
      breed: this.breed,
      age_years: this.age_years,
      age_months: this.age_months,
      weight: this.weight,
      castrated: this.castrated,
    };
  }
}
