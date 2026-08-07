/**
 * The 5 fixed message stages of the delinquency billing flow, in days
 * overdue.
 */
export const DELINQUENCY_TEMPLATE_STAGE_DAYS = [1, 2, 5, 10, 14] as const;

export type DelinquencyTemplateStageDays =
  (typeof DELINQUENCY_TEMPLATE_STAGE_DAYS)[number];

/** Response DTO for `DelinquencyMessageTemplate` — GET/PUT `.../templates`. */
export interface DelinquencyTemplateDto {
  stageDays: number;
  title: string;
  body: string;
  updatedById: string | null;
  updatedAt: string;
}

/** Body of `PUT /v1/admin/delinquency/templates/:stageDays`. */
export interface UpdateDelinquencyTemplateInput {
  title: string;
  body: string;
}

/**
 * Response row DTO for `GET /v1/admin/delinquency/clients` — one entry per
 * delinquent client (grouped across all of their delinquent plans/pets).
 *
 * `daysOverdue`/`delinquentSince`/`applicableStage` are `null` and
 * `trackingUnavailable` is `true` when the client's oldest delinquent plan
 * predates the `delinquentSince` tracking rollout (backfill gap) — the UI
 * must render a neutral state instead of a severity badge in that case.
 */
export interface DelinquentClientDto {
  clientId: string;
  clientName: string;
  clientPhone: string;
  daysOverdue: number | null;
  delinquentSince: string | null;
  applicableStage: number | null;
  petNames: string[];
  trackingUnavailable: boolean;
}

export interface DelinquentClientsResponse {
  data: DelinquentClientDto[];
}

export type DelinquencyClientsSort = "daysOverdue:asc" | "daysOverdue:desc";

export type DelinquencyDispatchChannel = "whatsapp_link" | "manual_copy";

/** Body of `POST /v1/admin/delinquency/clients/:clientId/dispatches`. */
export interface RecordDelinquencyDispatchInput {
  stageDays: number;
  channel: DelinquencyDispatchChannel;
}

/** Response of `POST /v1/admin/delinquency/clients/:clientId/dispatches`. */
export interface DelinquencyDispatchResult {
  id: string;
  clientId: string;
  stageDays: number;
  channel: DelinquencyDispatchChannel;
  userId: string;
  createdAt: string;
}
