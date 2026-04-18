/**
 * Shared types for the Pet domain.
 * These mirror the backend API interfaces defined in the TechSpec.
 */

export type PetSpecies = "canino" | "felino";

/** Input shape accepted by the RegisterPetUseCase. */
export interface RegisterPetInput {
  name: string;
  species: PetSpecies;
  breed: string;
  /** Full years of life (>= 0). */
  age_years: number;
  /** Months of life in the current year (0–11). */
  age_months: number;
  /** Weight in kg, must be > 0. */
  weight: number;
  castrated: boolean;
}

/** Payload sent to POST /v1/clients/:clientId/pets. */
export interface CreatePetPayload {
  name: string;
  species: PetSpecies;
  breed: string;
  age_years: number;
  age_months: number;
  weight: number;
  castrated: boolean;
}

/** Full pet detail returned by POST /v1/clients/:clientId/pets. */
export interface PetDetail {
  id: string;
  clientId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  /** ISO date string — approximate birth date computed by the backend. */
  birthDate: string;
  weight: number;
  castrated: boolean;
  createdAt: string;
}

/** Output returned by RegisterPetUseCase on success. */
export type RegisterPetResult = PetDetail;
