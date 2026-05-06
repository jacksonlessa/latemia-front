/**
 * cancelPlanWithTokenUseCase
 *
 * Calls POST /v1/plan-cancellation/consume (public endpoint — no auth
 * required) to apply a plan cancellation using a single-use token.
 *
 * Throws:
 * - `TokenExpiredError`              — 410 with code TOKEN_EXPIRED
 * - `TokenUsedError`                 — 410 with code TOKEN_USED
 * - `PaymentProviderUnavailableError`— 503
 * - `ApiError`                       — any other non-2xx response
 *
 * LGPD: token is never logged in full — callers must mask it before any log
 * statement (e.g. `token=${token.slice(0,4)}…`).
 */

import { ApiError } from '@/lib/api-errors';
import { TokenExpiredError, TokenUsedError } from './preview-cancel-plan.use-case';

export { TokenExpiredError, TokenUsedError };

export class PaymentProviderUnavailableError extends Error {
  readonly code = 'PAYMENT_PROVIDER_UNAVAILABLE';

  constructor(
    message = 'O serviço de pagamento está temporariamente indisponível. Tente novamente em instantes.',
  ) {
    super(message);
    this.name = 'PaymentProviderUnavailableError';
  }
}

export interface CancelPlanWithTokenParams {
  token: string;
  reason: string;
}

export interface CancelPlanWithTokenResult {
  coveredUntil: string | null;
}

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export async function cancelPlanWithTokenUseCase(
  params: CancelPlanWithTokenParams,
): Promise<CancelPlanWithTokenResult> {
  const res = await fetch(`${apiUrl()}/v1/plan-cancellation/consume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: params.token, reason: params.reason }),
    cache: 'no-store',
  });

  if (res.ok) {
    return res.json() as Promise<CancelPlanWithTokenResult>;
  }

  let body: { code?: string; message?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // non-JSON body — keep defaults
  }

  const code = body.code ?? 'UNKNOWN_ERROR';

  if (res.status === 410) {
    if (code === 'TOKEN_EXPIRED') throw new TokenExpiredError();
    if (code === 'TOKEN_USED') throw new TokenUsedError();
    // Unknown 410 sub-code — treat as expired
    throw new TokenExpiredError();
  }

  if (res.status === 503) {
    throw new PaymentProviderUnavailableError(body.message);
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
