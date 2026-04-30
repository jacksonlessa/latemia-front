/**
 * Shared types for the BenefitUsage domain.
 * Mirrors the backend interfaces in
 * `latemia-back/src/benefit-usages/interfaces/benefit-usage.interfaces.ts`.
 *
 * Note: `Decimal` values from Prisma are serialized by the backend as strings
 * with two fractional digits (e.g. `"1234.56"`) to avoid precision loss.
 */

/**
 * Non-blocking warnings returned by `POST /v1/benefit-usages` when the related
 * plan is in `carencia` or `inadimplente` state. The UI uses these to render
 * an informational banner — usage creation is still permitted.
 */
export type BenefitUsageWarning = "PLAN_IN_GRACE_PERIOD" | "PLAN_DELINQUENT";

/**
 * Resumo do usuário interno (id + nome) populado pelo backend nas relações
 * `creator` e `updater`. A UI usa para exibir o responsável sem precisar
 * de uma chamada adicional ao endpoint de usuários.
 */
export interface BenefitUsageUserRef {
  id: string;
  name: string;
}

/** DTO returned by the backend for a single benefit usage. */
export interface BenefitUsageResponse {
  id: string;
  planId: string;
  attendedAt: string;
  procedureDescription: string;
  isEmergency: boolean;
  totalValue: string;
  discountApplied: string;
  createdBy: string;
  updatedBy: string | null;
  creator: BenefitUsageUserRef;
  updater: BenefitUsageUserRef | null;
  createdAt: string;
  updatedAt: string;
  warnings?: BenefitUsageWarning[];
}

/** Generic paginated wrapper used by list endpoints under `/v1/benefit-usages`. */
export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Input payloads
// ---------------------------------------------------------------------------

/** Payload accepted by `POST /v1/benefit-usages`. */
export interface CreateBenefitUsageInput {
  planId: string;
  attendedAt: string;
  procedureDescription: string;
  isEmergency: boolean;
  /** Decimal as string with 2 fractional digits, e.g. `"1234.56"`. */
  totalValue: string;
  /** Decimal as string with 2 fractional digits, e.g. `"100.00"`. */
  discountApplied: string;
}

/**
 * Payload accepted by `PATCH /v1/benefit-usages/:id`.
 * `planId` is intentionally absent — the backend rejects it.
 */
export interface UpdateBenefitUsageInput {
  attendedAt?: string;
  procedureDescription?: string;
  isEmergency?: boolean;
  totalValue?: string;
  discountApplied?: string;
}
