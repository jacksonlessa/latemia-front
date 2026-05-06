/**
 * consumePaymentUpdateTokenUseCase
 *
 * Submits a Pagar.me card token to the public Route Handler
 * POST /api/public/payment-update/:token, which proxies to the backend.
 *
 * The backend will update the subscription's payment method and, when the
 * plan is `pendente`/`inadimplente`, also retry the open charge synchronously.
 *
 * Returns ConsumeResult on success (200). The `outcome` field describes the
 * effective result:
 *   - `card_updated_no_charge` — `ativo`/`carencia`: card updated, no charge.
 *   - `charge_paid`            — retry approved.
 *   - `charge_pending`         — retry accepted, still processing.
 *   - `charge_failed`          — retry refused; token remains ACTIVE so the
 *                                client may try another card without a new link.
 *                                `failureMessage` may carry a gateway message.
 *
 * Throws TokenInvalidError on 404.
 * Throws ConsumePaymentError on 400 (validation/gateway errors prior to retry)
 *   and on other non-ok responses.
 *
 * PCI: the `cardToken` parameter is a Pagar.me tokenized reference — PAN
 * and CVV never appear here.
 */

import type { ConsumeResult } from './types';
import { TokenInvalidError } from './validate-payment-update-token.use-case';

export class ConsumePaymentError extends Error {
  readonly code = 'CONSUME_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'ConsumePaymentError';
  }
}

interface BackendErrorBody {
  code?: string;
  message?: string;
}

export async function consumePaymentUpdateToken(
  token: string,
  cardToken: string,
): Promise<ConsumeResult> {
  let res: Response;
  try {
    res = await fetch(`/api/public/payment-update/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardToken }),
    });
  } catch {
    throw new ConsumePaymentError(
      'Erro de conexão. Verifique sua internet e tente novamente.',
    );
  }

  if (res.status === 404) {
    throw new TokenInvalidError();
  }

  if (res.status === 400) {
    let message = 'Não foi possível atualizar o cartão. Verifique os dados e tente novamente.';
    try {
      const body = (await res.json()) as BackendErrorBody;
      if (body.message && typeof body.message === 'string') {
        message = body.message;
      }
    } catch {
      // keep default message
    }
    throw new ConsumePaymentError(message);
  }

  if (!res.ok) {
    throw new ConsumePaymentError(
      'Erro inesperado ao atualizar o cartão. Tente novamente.',
    );
  }

  return res.json() as Promise<ConsumeResult>;
}
