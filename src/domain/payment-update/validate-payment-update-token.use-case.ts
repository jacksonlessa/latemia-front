/**
 * validatePaymentUpdateTokenUseCase
 *
 * Validates a payment-update token by calling the public Route Handler
 * GET /api/public/payment-update/:token, which proxies to the backend.
 *
 * Returns a TokenContext on success (200).
 * Throws an Error with code 'TOKEN_INVALID' on 404 (invalid/expired/used).
 * Throws an Error with code 'NETWORK_ERROR' on fetch failure.
 *
 * LGPD: no PII is sent or returned; only tutorMaskedName and petsCovered are exposed.
 */

import type { TokenContext } from './types';

export class TokenInvalidError extends Error {
  readonly code = 'TOKEN_INVALID';
  constructor() {
    super('Token inválido, expirado ou já utilizado.');
    this.name = 'TokenInvalidError';
  }
}

export async function validatePaymentUpdateToken(
  token: string,
): Promise<TokenContext> {
  let res: Response;
  try {
    res = await fetch(`/api/public/payment-update/${encodeURIComponent(token)}`, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch {
    throw new Error('NETWORK_ERROR');
  }

  if (res.status === 404) {
    throw new TokenInvalidError();
  }

  if (!res.ok) {
    throw new Error(`HTTP_${res.status}`);
  }

  return res.json() as Promise<TokenContext>;
}
