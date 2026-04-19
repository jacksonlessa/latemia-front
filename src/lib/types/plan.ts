/**
 * Shared types for the Plan domain.
 * These mirror the backend API interfaces defined in the TechSpec.
 */

export type PlanStatus = 'pendente' | 'ativo' | 'inadimplente' | 'cancelado';

export type PaymentStatus = 'pendente' | 'pago' | 'cancelado';

/** Lightweight row returned by GET /v1/plans list. */
export interface PlanListItem {
  id: string;
  status: PlanStatus;
  clientName: string;
  petName: string;
  createdAt: string;
}

export interface PlanListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlanListResponse {
  data: PlanListItem[];
  meta: PlanListMeta;
}

/** Payment stub returned inside plan detail. */
export interface Payment {
  id: string;
  status: PaymentStatus;
  amount: number;
  createdAt: string;
  paidAt?: string;
}

/** Full plan detail returned by GET /v1/plans/:id. */
export interface PlanDetail {
  id: string;
  status: PlanStatus;
  createdAt: string;
  pet: {
    name: string;
    species: string;
    breed?: string;
    weight?: number;
    castrated: boolean;
    birthDate: string;
  };
  /** Client data already masked by backend (LGPD). */
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  contract: {
    id: string;
    version: string;
    consentedAt: string;
  };
  payments: Payment[];
}
