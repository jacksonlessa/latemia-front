/**
 * Shared types for the Plan domain.
 * These mirror the backend API interfaces defined in the TechSpec.
 */

export type PlanStatus =
  | 'pendente'
  | 'carencia'
  | 'ativo'
  | 'inadimplente'
  | 'cancelado'
  | 'estornado'
  | 'contestado';

/**
 * Set of Plan statuses considered terminal — no event reactivates the Plan
 * once it lands in one of these states.
 */
export const TERMINAL_PLAN_STATUSES: ReadonlySet<PlanStatus> = new Set<PlanStatus>([
  'cancelado',
  'estornado',
  'contestado',
]);

export function isTerminalPlanStatus(status: PlanStatus): boolean {
  return TERMINAL_PLAN_STATUSES.has(status);
}

export type PaymentStatus =
  | 'pendente'
  | 'pago'
  | 'em_atraso'
  | 'inadimplente'
  | 'cancelado'
  | 'estornado'
  | 'contestado';

/** Lightweight row returned by GET /v1/plans list. */
export interface PlanListItem {
  id: string;
  status: PlanStatus;
  clientId: string;
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
  /** Code returned by the gateway when a charge fails (e.g. `card_declined`). */
  failureCode?: string;
  /** ISO timestamp when a charge was refunded (full or partial). */
  refundedAt?: string;
}

/** Full plan detail returned by GET /v1/plans/:id. */
export interface PlanDetail {
  id: string;
  status: PlanStatus;
  createdAt: string;
  /** Pagar.me subscription identifier — present once the subscription is created. */
  pagarmeSubscriptionId?: string;
  /** ISO timestamp of the first approved charge — sets the grace-period anchor. */
  firstPaidAt?: string;
  /** ISO timestamp marking the end of the 6-month grace period. */
  gracePeriodEndsAt?: string;
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

/** Webhook event recebido do provider (admin-only). */
export interface PlanWebhookEvent {
  id: string;
  eventType: string;
  signatureValid: boolean;
  pagarmeSubscriptionId: string | null;
  receivedAt: string;
  processedAt?: string;
  processingError?: string;
  payload: unknown;
}
