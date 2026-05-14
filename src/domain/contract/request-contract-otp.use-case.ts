/**
 * RequestContractOtpUseCase
 *
 * Calls `POST /v1/otp/contract/request` and maps backend error codes
 * (OTP_INVALID, OTP_COOLDOWN_ACTIVE, etc.) into user-facing messages
 * exposed through `ValidationError` — the same error type used by the
 * other public flow use-cases (`RegisterContractUseCase`,
 * `RegisterClientUseCase`).
 *
 * The `OTP_FEATURE_DISABLED` code is special: the caller is expected to
 * silently fall back to the legacy flow. We surface it through a dedicated
 * `FeatureDisabledError` so the caller can branch without parsing error
 * messages.
 *
 * LGPD: the phone number itself is PII and never appears in
 * `ValidationError` messages or logs — only the `phoneMasked` value
 * returned by the backend is safe to display.
 */

import { ValidationError } from '@/lib/validation-error';
import { FeatureDisabledError } from '@/lib/feature-disabled-error';
import { getApiUrl, extractErrorCode } from '@/lib/api-client';
import type { ApiErrorBody } from '@/lib/api-client';
import { httpFetch } from '@/lib/http';
import {
  CONTRACT_OTP_ERROR_MESSAGES,
  GENERIC_NETWORK_ERROR_MESSAGE,
} from './contract-otp-error-messages';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RequestContractOtpInput {
  contractAttemptId: string;
  /** E.164 BR phone (`+55XXXXXXXXXXX`). */
  phone: string;
}

export interface RequestContractOtpResult {
  phoneMasked: string;
  expiresInSeconds: number;
  cooldownSeconds: number;
}

// ---------------------------------------------------------------------------
// API error mapping
// ---------------------------------------------------------------------------

async function mapRequestApiError(res: Response): Promise<Error> {
  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    /* fall-through */
  }
  const code = extractErrorCode(body);

  if (code === 'OTP_FEATURE_DISABLED') {
    return new FeatureDisabledError('OTP_FEATURE_DISABLED');
  }

  const message =
    CONTRACT_OTP_ERROR_MESSAGES[code] ?? GENERIC_NETWORK_ERROR_MESSAGE;
  return new ValidationError({ _form: message, _code: code });
}

// ---------------------------------------------------------------------------
// UseCase
// ---------------------------------------------------------------------------

export class RequestContractOtpUseCase {
  async execute(
    input: RequestContractOtpInput,
  ): Promise<RequestContractOtpResult> {
    let res: Response;
    try {
      res = await httpFetch(getApiUrl('/v1/otp/contract/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_attempt_id: input.contractAttemptId,
          phone: input.phone,
        }),
      });
    } catch {
      throw new ValidationError({ _form: GENERIC_NETWORK_ERROR_MESSAGE });
    }

    if (!res.ok) {
      throw await mapRequestApiError(res);
    }

    const body = (await res.json()) as {
      phone_masked: string;
      expires_in_seconds: number;
      cooldown_seconds: number;
    };

    return {
      phoneMasked: body.phone_masked,
      expiresInSeconds: body.expires_in_seconds,
      cooldownSeconds: body.cooldown_seconds,
    };
  }
}
