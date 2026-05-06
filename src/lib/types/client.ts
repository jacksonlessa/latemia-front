/**
 * Shared types for the Client domain.
 * These mirror the backend API interfaces defined in the TechSpec.
 */

import type { Touchpoint } from "@/domain/touchpoints/touchpoints.types";

/**
 * Re-exported here for callers that consume the client domain types
 * (e.g. checkout flow) without having to depend on the touchpoints module
 * directly. The canonical definition lives in `domain/touchpoints/`.
 */
export type { Touchpoint };

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string; // bairro — preenchido via ViaCEP
  city: string;
  state: string;
}

/** Input shape accepted by the RegisterClientUseCase. */
export interface RegisterClientInput {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: AddressData;
}

/** Payload sent to POST /v1/clients — digits-only phone, canonical CPF. */
export interface CreateClientPayload {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: AddressData;
  /**
   * Optional attribution bundle persisted alongside the client record
   * (PRD seo-analytics-lgpd-utm §1.3–§1.6). When omitted, the backend
   * creates the client with no `client_touchpoints` rows. Each side is
   * also optional so we never send `null` for a missing touchpoint —
   * the field is simply omitted from the payload (backend uses
   * `@IsOptional` validation).
   */
  touchpoints?: {
    first?: Touchpoint;
    last?: Touchpoint;
  };
}

export interface AddressDetail {
  id: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  createdAt: string;
}

export interface PetListItem {
  id: string;
  name: string;
  species: "canino" | "felino";
  breed: string;
  birthDate: string;
  sex: "male" | "female";
  weight: number;
  castrated: boolean;
  createdAt: string;
}

/** Full client detail returned by POST /v1/clients and GET /v1/clients/:id. */
export interface ClientDetail {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  addresses: AddressDetail[];
  pets: PetListItem[];
  createdAt: string;
}

/** Lightweight row returned by GET /v1/clients list. */
export interface ClientListItem {
  id: string;
  name: string;
  cpfMasked: string;
  phoneMasked: string;
  email: string;
  createdAt: string;
}

export interface PaginatedClients {
  data: ClientListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Output returned by RegisterClientUseCase on success. */
export type RegisterClientResult = ClientDetail;

/**
 * Payload sent to PATCH /v1/clients/:id.
 * CPF is intentionally excluded — it is immutable.
 */
export interface UpdateClientPayload {
  name?: string;
  phone?: string;
  email?: string;
  address?: Partial<AddressDetail>;
}
