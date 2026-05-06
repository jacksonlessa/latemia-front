/**
 * previewCancelPlanUseCase
 *
 * Calls GET /v1/plan-cancellation/preview?token=... (public endpoint — no auth
 * required) and returns the masked plan data for the cancellation confirmation
 * screen.
 *
 * Throws:
 * - `TokenNotFoundError`   — 404
 * - `TokenExpiredError`    — 410 with code TOKEN_EXPIRED
 * - `TokenUsedError`       — 410 with code TOKEN_USED
 * - `ApiError`             — any other non-2xx response
 *
 * LGPD: token is never logged in full — callers must mask it before any log
 * statement (e.g. `token=${token.slice(0,4)}…`).
 */

import { ApiError } from '@/lib/api-errors';

export interface CancelPlanPreview {
  /** Masked client name (e.g. "J*** L***") */
  clientName: string;
  /** Pet name */
  petName: string;
  /** Plan status at token-generation time */
  planStatus: string;
  /** ISO date string — end of current paid cycle */
  coveredUntil: string | null;
}

export class TokenNotFoundError extends Error {
  readonly code = 'TOKEN_NOT_FOUND';

  constructor() {
    super('Link inválido. Verifique se a URL está correta.');
    this.name = 'TokenNotFoundError';
  }
}

export class TokenExpiredError extends Error {
  readonly code = 'TOKEN_EXPIRED';

  constructor() {
    super(
      'Este link expirou. Entre em contato com o atendimento para um novo link.',
    );
    this.name = 'TokenExpiredError';
  }
}

export class TokenUsedError extends Error {
  readonly code = 'TOKEN_USED';

  constructor() {
    super(
      'Este link já foi utilizado. Se foi você, seu cancelamento já está registrado.',
    );
    this.name = 'TokenUsedError';
  }
}

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export async function previewCancelPlanUseCase(
  token: string,
): Promise<CancelPlanPreview> {
  const res = await fetch(
    `${apiUrl()}/v1/plan-cancellation/preview?token=${encodeURIComponent(token)}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );

  if (res.ok) {
    return res.json() as Promise<CancelPlanPreview>;
  }

  let body: { code?: string; message?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // non-JSON body — keep defaults
  }

  const code = body.code ?? 'UNKNOWN_ERROR';

  if (res.status === 404) {
    throw new TokenNotFoundError();
  }

  if (res.status === 410) {
    if (code === 'TOKEN_EXPIRED') throw new TokenExpiredError();
    if (code === 'TOKEN_USED') throw new TokenUsedError();
    // Unknown 410 sub-code — treat as expired
    throw new TokenExpiredError();
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
