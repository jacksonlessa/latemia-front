/**
 * Pet domain entity.
 *
 * Validates input before sending to the API.
 * Throws ValidationError (with per-field errors) for invalid input.
 * No personal data is included in error messages.
 */

import type {
  CreatePetPayload,
  PetSex,
  PetSpecies,
  RegisterPetInput,
} from "@/lib/types/pet";
import { ValidationError } from "@/lib/validation-error";

// Re-export ValidationError so callers can import from either entity file.
export { ValidationError };

const VALID_SPECIES: ReadonlySet<string> = new Set<PetSpecies>([
  "canino",
  "felino",
]);

const VALID_SEX: ReadonlySet<string> = new Set<PetSex>(["male", "female"]);

const MAX_AGE_YEARS = 30;
const MIN_WEIGHT = 0.1;
const MAX_WEIGHT = 100;

// ---------------------------------------------------------------------------
// PetEntity
// ---------------------------------------------------------------------------

export class PetEntity {
  private constructor(
    public readonly name: string,
    public readonly species: PetSpecies,
    public readonly breed: string,
    /** Birth date. Always a valid past Date within the last 30 years. */
    public readonly birthDate: Date,
    public readonly sex: PetSex,
    /** Weight in kg, between 0.1 and 100. */
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

    // birthDate — must be a finite Date, in the past, within 30 years
    if (
      !(input.birthDate instanceof Date) ||
      Number.isNaN(input.birthDate.getTime())
    ) {
      errors["birthDate"] = "Data de nascimento inválida";
    } else {
      const now = new Date();
      if (input.birthDate >= now) {
        errors["birthDate"] = "Data de nascimento deve ser no passado";
      } else {
        const maxPast = new Date();
        maxPast.setFullYear(maxPast.getFullYear() - MAX_AGE_YEARS);
        if (input.birthDate < maxPast) {
          errors["birthDate"] =
            "Pet com mais de 30 anos? Verifique a data.";
        }
      }
    }

    // sex — must be 'male' | 'female'
    if (!input.sex || !VALID_SEX.has(input.sex)) {
      errors["sex"] = "Selecione o sexo do pet";
    }

    // weight — must be between 0.1 and 100
    if (
      input.weight === undefined ||
      input.weight === null ||
      typeof input.weight !== "number" ||
      !Number.isFinite(input.weight) ||
      input.weight < MIN_WEIGHT ||
      input.weight > MAX_WEIGHT
    ) {
      errors["weight"] = "Peso deve estar entre 0,1 e 100 kg";
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
      input.birthDate,
      input.sex,
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
      birthDate: this.birthDate.toISOString(),
      sex: this.sex,
      weight: this.weight,
      castrated: this.castrated,
    };
  }
}
