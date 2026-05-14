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
import { httpFetch } from '@/lib/http';

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
  /**
   * Chave de idempotência por tentativa — gerada pelo `FinalizeCheckoutUseCase`
   * e propagada para que o backend deduplicar reenvios em rede instável.
   */
  idempotencyKey?: string;
  /**
   * Token opaco emitido por `POST /v1/otp/contract/verify`. Quando a flag
   * `otp_contract_enabled` está ativa, o backend exige este campo no
   * payload de `POST /v1/register/contract` — sua ausência resulta em
   * `403 OTP_VERIFICATION_REQUIRED`. Não-PII.
   */
  verificationToken?: string;
  /**
   * UUID v4 de correlação gerado pelo FE no clique de "Avançar" do passo
   * 2 do `/contratar`. Vincula o token de verificação ao mesmo ciclo OTP.
   * Não-PII.
   */
  contractAttemptId?: string;
  /**
   * SHA-256 hex do `CONTRATO_TEXTO` exibido no passo 2. Persistido pelo
   * backend em `ContractAcceptanceEvidence` como prova do conteúdo aceito.
   * Texto público — não-PII.
   */
  contractTextHash?: string;
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
        _code: code,
      });

    case 'PET_NOT_FOUND':
      return new ValidationError({
        _form: 'Um ou mais pets não foram encontrados. Reinicie o cadastro.',
        _code: code,
      });

    case 'PET_CLIENT_MISMATCH':
      return new ValidationError({
        _form: 'Inconsistência de dados. Reinicie o cadastro.',
        _code: code,
      });

    // Task 11.0 — OTP verification gates (403 from backend when the
    // `otp_contract_enabled` flag is on). Both codes map to the same
    // user-facing message; the `_code` lets the parent page distinguish
    // OTP errors from other validation failures and offer the "Voltar
    // ao contrato" remediation.
    case 'OTP_VERIFICATION_REQUIRED':
    case 'OTP_VERIFICATION_TOKEN_INVALID':
      return new ValidationError({
        _form:
          'Sua verificação expirou. Volte ao passo anterior para refazer o código.',
        _code: code,
      });

    default:
      return new ValidationError({
        _form: 'Ocorreu um erro inesperado. Tente novamente.',
        _code: code,
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

    // Task 11.0 — OTP evidence fields. Sent only when present so the
    // legacy flow (flag off) remains a strict subset of the wire format.
    if (input.verificationToken) {
      body.verification_token = input.verificationToken;
    }
    if (input.contractAttemptId) {
      body.contract_attempt_id = input.contractAttemptId;
    }
    if (input.contractTextHash) {
      body.contract_text_hash = input.contractTextHash;
    }

    let res: Response;
    try {
      res = await httpFetch(getApiUrl('/v1/register/contract'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        idempotent: Boolean(input.idempotencyKey),
        idempotencyKey: input.idempotencyKey,
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
