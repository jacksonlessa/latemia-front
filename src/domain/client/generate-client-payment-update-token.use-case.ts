/**
 * generateClientPaymentUpdateTokenUseCase
 *
 * Calls POST /api/admin/clients/:clientId/payment-update-token (the internal
 * Next.js Route Handler) to generate a tokenized payment-update URL for a
 * client with at least one eligible plan.
 *
 * The Route Handler proxies the request to the backend, attaching the JWT
 * bearer token from the httpOnly session cookie.
 *
 * Replaces the plan-scoped `generatePaymentUpdateLinkUseCase` after the pivot
 * to a single subscription per client (PRD pivo-subscription-consolidada-pagarme).
 * The generated link updates the card for ALL pets covered under the client's
 * single Pagar.me subscription.
 *
 * On success, returns the generated token data including the shareable URL.
 * On backend 422 the client has no eligible plans — throws
 * `ClientIneligibleForPaymentUpdateError`.
 * On other failures throws `ApiError`.
 *
 * LGPD: no personal data is logged — only clientId and error codes.
 */

import { ApiError } from '@/lib/api-errors';

export interface GenerateClientTokenResponse {
  token: string;
  url: string;
  expiresAt: string;
  status: 'active';
}

/**
 * Thrown when the backend returns 422, meaning the client has no eligible
 * plans (all are in terminal statuses: `cancelado`, `estornado`, `contestado`)
 * and a payment-update link cannot be generated.
 *
 * The admin UI gates visibility using `pagarmeSubscriptionId` and
 * `paymentUpdateEligible`, so this error is only expected when the last
 * eligible plan transitions to a terminal status between page render and click,
 * or when an operator forces the request via DevTools.
 */
export class ClientIneligibleForPaymentUpdateError extends Error {
  readonly code = 'CLIENT_NOT_ELIGIBLE_FOR_PAYMENT_UPDATE';
  readonly status = 422;

  constructor(
    message = 'O link de atualização de pagamento não pode ser gerado. O cliente não possui planos elegíveis (todos estão cancelados, estornados ou contestados).',
  ) {
    super(message);
    this.name = 'ClientIneligibleForPaymentUpdateError';
  }
}

/**
 * Generates a payment-update link for the given client.
 *
 * Throws:
 * - `ClientIneligibleForPaymentUpdateError` when the backend returns 422.
 * - `ApiError` for any other non-2xx response.
 */
export async function generateClientPaymentUpdateTokenUseCase(
  clientId: string,
): Promise<GenerateClientTokenResponse> {
  const res = await fetch(
    `/api/admin/clients/${encodeURIComponent(clientId)}/payment-update-token`,
    {
      method: 'POST',
      cache: 'no-store',
    },
  );

  if (res.ok) {
    return res.json() as Promise<GenerateClientTokenResponse>;
  }

  let body: { code?: string; message?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // non-JSON body — keep defaults
  }

  const code = body.code ?? 'UNKNOWN_ERROR';

  if (res.status === 422) {
    throw new ClientIneligibleForPaymentUpdateError(body.message);
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
