/**
 * generatePaymentUpdateLinkUseCase
 *
 * Calls POST /api/admin/plans/:planId/payment-update-token (the internal
 * Next.js Route Handler) to generate a tokenized payment-update URL for a
 * plan in an eligible status (`ativo`, `carencia`, `pendente`, `inadimplente`).
 *
 * The Route Handler proxies the request to the backend, attaching the JWT
 * bearer token from the httpOnly session cookie.
 *
 * On success, returns the generated token data including the shareable URL.
 * On backend 422 the plan is in a terminal status (`cancelado`, `estornado`,
 * `contestado`) and a link cannot be generated — throws
 * `PlanIneligibleForPaymentUpdateError`.
 * On other failures throws `ApiError`.
 *
 * LGPD: no personal data is logged — only planId and error codes.
 */

import { ApiError } from '@/lib/api-errors';

export interface GenerateTokenResponse {
  token: string;
  url: string;
  expiresAt: string;
  status: 'active';
}

/**
 * Thrown when the backend returns 422, meaning the plan is in a terminal
 * status (`cancelado`, `estornado` or `contestado`) and a payment-update
 * link cannot be generated.
 *
 * The admin UI normally hides the section for terminal statuses (see
 * `canGeneratePaymentUpdateLink`), so this error is only expected when
 * an operator forces the request via DevTools / direct API call, or when
 * the plan transitions to a terminal status between page render and click.
 */
export class PlanIneligibleForPaymentUpdateError extends Error {
  readonly code = 'PLAN_NOT_ELIGIBLE_FOR_PAYMENT_UPDATE';
  readonly status = 422;

  constructor(
    message = 'O link de atualização de pagamento não pode ser gerado para planos cancelados, estornados ou contestados.',
  ) {
    super(message);
    this.name = 'PlanIneligibleForPaymentUpdateError';
  }
}

/**
 * @deprecated Use `PlanIneligibleForPaymentUpdateError` — kept as an alias
 * for backward compatibility with existing callers/tests. Will be removed
 * in a follow-up.
 */
export const PlanNotInadimplenteError = PlanIneligibleForPaymentUpdateError;
export type PlanNotInadimplenteError = PlanIneligibleForPaymentUpdateError;

/**
 * Generates a payment-update link for the given plan.
 *
 * Throws:
 * - `PlanIneligibleForPaymentUpdateError` when the backend returns 422.
 * - `ApiError` for any other non-2xx response.
 */
export async function generatePaymentUpdateLinkUseCase(
  planId: string,
): Promise<GenerateTokenResponse> {
  const res = await fetch(
    `/api/admin/plans/${encodeURIComponent(planId)}/payment-update-token`,
    {
      method: 'POST',
      cache: 'no-store',
    },
  );

  if (res.ok) {
    return res.json() as Promise<GenerateTokenResponse>;
  }

  let body: { code?: string; message?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // non-JSON body — keep defaults
  }

  const code = body.code ?? 'UNKNOWN_ERROR';

  if (res.status === 422) {
    throw new PlanIneligibleForPaymentUpdateError(body.message);
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
