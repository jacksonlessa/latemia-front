/**
 * generatePaymentUpdateLinkUseCase
 *
 * Calls POST /api/admin/plans/:planId/payment-update-token (the internal
 * Next.js Route Handler) to generate a tokenized payment-update URL for a
 * plan in `inadimplente` status.
 *
 * The Route Handler proxies the request to the backend, attaching the JWT
 * bearer token from the httpOnly session cookie.
 *
 * On success, returns the generated token data including the shareable URL.
 * On backend 422 the plan is not inadimplente — throws `PlanNotInadimplenteError`.
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
 * Thrown when the backend returns 422, meaning the plan is not currently
 * in `inadimplente` status and a link cannot be generated.
 */
export class PlanNotInadimplenteError extends Error {
  readonly code = 'PLAN_NOT_INADIMPLENTE';
  readonly status = 422;

  constructor(message = 'O link só pode ser gerado para planos inadimplentes.') {
    super(message);
    this.name = 'PlanNotInadimplenteError';
  }
}

/**
 * Generates a payment-update link for the given plan.
 *
 * Throws:
 * - `PlanNotInadimplenteError` when the backend returns 422.
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
    throw new PlanNotInadimplenteError(
      body.message ?? 'O link só pode ser gerado para planos inadimplentes.',
    );
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
