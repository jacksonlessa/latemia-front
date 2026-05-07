/**
 * RegisterContractUseCase
 *
 * Calls POST /v1/register/contract and maps API error codes to user-friendly
 * messages via ValidationError. No personal data is included in thrown errors
 * or logs.
 */

import { ValidationError } from '@/lib/validation-error';
import { getApiUrl, extractErrorCode } from '@/lib/api-client';
import type { ApiErrorBody } from '@/lib/api-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RegisterContractSubscriptionItem {
  pet_id: string;
  pagarme_subscription_item_id?: string;
}

export interface RegisterContractSubscription {
  pagarme_subscription_id: string;
  items: RegisterContractSubscriptionItem[];
}

export interface RegisterContractInput {
  clientId: string;
  petIds: string[];
  contractVersion: string;
  consentedAt: string; // ISO timestamp from client clock
  /**
   * Subscription consolidada Pagar.me (1 por cliente, com N items).
   * Quando ausente, o backend aceita a chamada sem vínculo de provider —
   * útil para fluxos legados em dev. No fluxo principal `/contratar`
   * esse campo é sempre enviado.
   */
  subscription?: RegisterContractSubscription;
}

export interface RegisterContractResult {
  contract_id: string;
  plan_ids: string[];
}

// ---------------------------------------------------------------------------
// API error mapping
// ---------------------------------------------------------------------------

async function mapContractApiError(res: Response): Promise<ValidationError> {
  // Handle 429 before parsing body — throttler may not include a business code
  if (res.status === 429) {
    return new ValidationError({
      _form: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
    });
  }

  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // JSON parse failure — fall through to generic error
  }

  const code = extractErrorCode(body);

  switch (code) {
    case 'CLIENT_NOT_FOUND':
      return new ValidationError({
        _form: 'Cliente não encontrado. Reinicie o cadastro.',
      });

    case 'PET_NOT_FOUND':
      return new ValidationError({
        _form: 'Um ou mais pets não foram encontrados. Reinicie o cadastro.',
      });

    case 'PET_CLIENT_MISMATCH':
      return new ValidationError({
        _form: 'Inconsistência de dados. Reinicie o cadastro.',
      });

    default:
      return new ValidationError({
        _form: 'Ocorreu um erro inesperado. Tente novamente.',
      });
  }
}

// ---------------------------------------------------------------------------
// UseCase
// ---------------------------------------------------------------------------

export class RegisterContractUseCase {
  /**
   * Calls the API to create a Contract, Plans, and Payments atomically.
   *
   * Throws ValidationError for:
   *   - Known API business errors (CLIENT_NOT_FOUND, PET_NOT_FOUND, etc.)
   *   - Network failures (mapped to _form field)
   *
   * @param input - Contract registration data collected from the wizard.
   */
  async execute(input: RegisterContractInput): Promise<RegisterContractResult> {
    const body: Record<string, unknown> = {
      client_id: input.clientId,
      pet_ids: input.petIds,
      contract_version: input.contractVersion,
      consent_metadata: {
        client_timestamp: input.consentedAt,
        accepted_at: input.consentedAt,
        user_agent:
          typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
    };

    if (input.subscription) {
      body.subscription = input.subscription;
    }

    let res: Response;
    try {
      res = await fetch(getApiUrl('/v1/register/contract'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      // Network failure — no personal data in error
      throw new ValidationError({
        _form: 'Erro de conexão. Verifique sua internet e tente novamente.',
      });
    }

    if (!res.ok) {
      throw await mapContractApiError(res);
    }

    return res.json() as Promise<RegisterContractResult>;
  }
}
