/**
 * Shared types for the Pet domain.
 * These mirror the backend API interfaces defined in the TechSpec.
 */

export type PetSpecies = "canino" | "felino";

export type PetSex = "male" | "female";

/** Input shape accepted by the RegisterPetUseCase. */
export interface RegisterPetInput {
  name: string;
  species: PetSpecies;
  breed: string;
  /** Birth date as a JS Date. Must be in the past and within the last 30 years. */
  birthDate: Date;
  sex: PetSex;
  /** Weight in kg, must be between 0.1 and 100. */
  weight: number;
  castrated: boolean;
}

/** Payload sent to POST /v1/register/pet. */
export interface CreatePetPayload {
  name: string;
  species: PetSpecies;
  breed: string;
  /** ISO 8601 string derived from `birthDate`. */
  birthDate: string;
  sex: PetSex;
  weight: number;
  castrated: boolean;
}

/** Full pet detail returned by POST /v1/register/pet. */
export interface PetDetail {
  id: string;
  clientId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  /** ISO date string returned by the backend. */
  birthDate: string;
  sex: PetSex;
  weight: number;
  castrated: boolean;
  createdAt: string;
}

/** Output returned by RegisterPetUseCase on success. */
export type RegisterPetResult = PetDetail;
