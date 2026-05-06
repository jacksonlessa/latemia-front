/**
 * cancelPlanUseCase
 *
 * Calls POST /api/admin/plans/:planId/cancel (the internal Next.js Route
 * Handler) to cancel a plan from the admin panel. The Route Handler proxies
 * the request to the backend, attaching the JWT bearer token from the httpOnly
 * session cookie.
 *
 * On success, returns `{ coveredUntil, cancellationId }`.
 *
 * Typed errors:
 * - `PlanAlreadyCancelledError` — backend 409 (idempotent; plan was already
 *   cancelled before this call).
 * - `PaymentProviderUnavailableError` — backend 503 (Pagar.me timeout or
 *   unavailability; local state was NOT changed).
 * - `ApiError` — any other non-2xx response.
 *
 * LGPD: reason text is never logged here — only planId and error codes.
 */

import { ApiError } from '@/lib/api-errors';

// ---------------------------------------------------------------------------
// Typed errors
// ---------------------------------------------------------------------------

/**
 * Thrown when the backend returns 409, meaning the plan is already in
 * `cancelado` status. The backend response is idempotent and may include
 * the existing `cancellationId`.
 */
export class PlanAlreadyCancelledError extends Error {
  readonly code = 'PLAN_ALREADY_CANCELLED';
  readonly status = 409;
  readonly cancellationId: string | undefined;

  constructor(cancellationId?: string, message = 'Este plano já foi cancelado.') {
    super(message);
    this.name = 'PlanAlreadyCancelledError';
    this.cancellationId = cancellationId;
  }
}

/**
 * Thrown when the backend returns 503, meaning the payment provider (Pagar.me)
 * was unreachable or timed out. The cancellation was NOT applied locally.
 */
export class PaymentProviderUnavailableError extends Error {
  readonly code = 'PROVIDER_UNAVAILABLE';
  readonly status = 503;

  constructor(
    message = 'Provedor de pagamento indisponível, tente novamente em instantes.',
  ) {
    super(message);
    this.name = 'PaymentProviderUnavailableError';
  }
}

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

export interface CancelPlanResult {
  /** ISO date string marking the end of the already-paid coverage period. */
  coveredUntil: string | null;
  /** UUID of the created (or existing, if idempotent) cancellation log entry. */
  cancellationId: string;
}

// ---------------------------------------------------------------------------
// Use case
// ---------------------------------------------------------------------------

/**
 * Cancels the plan identified by `planId` via the admin Route Handler.
 *
 * @param planId  UUID of the plan to cancel.
 * @param reason  Operator-provided reason (min 10 chars, validated on backend).
 *
 * Throws `PlanAlreadyCancelledError`, `PaymentProviderUnavailableError`, or
 * `ApiError` on failure.
 */
export async function cancelPlanUseCase(params: {
  planId: string;
  reason: string;
}): Promise<CancelPlanResult> {
  const { planId, reason } = params;

  const res = await fetch(
    `/api/admin/plans/${encodeURIComponent(planId)}/cancel`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
      cache: 'no-store',
    },
  );

  if (res.ok) {
    return res.json() as Promise<CancelPlanResult>;
  }

  let body: { code?: string; message?: string; cancellationId?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // Non-JSON body — keep defaults.
  }

  const code = body.code ?? 'UNKNOWN_ERROR';

  if (res.status === 409) {
    throw new PlanAlreadyCancelledError(body.cancellationId, body.message);
  }

  if (res.status === 503) {
    throw new PaymentProviderUnavailableError(body.message);
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
