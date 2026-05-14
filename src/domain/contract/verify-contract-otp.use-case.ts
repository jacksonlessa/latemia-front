/**
 * VerifyContractOtpUseCase
 *
 * Calls `POST /v1/otp/contract/verify` with the 6-digit code typed by the
 * user and returns the opaque `verificationToken` (UUID v4) emitted by the
 * backend on success. The token is stored in component state and forwarded
 * to `POST /v1/register/contract` so the backend can attach the OTP
 * evidence to the contract within the same Prisma transaction.
 *
 * Error codes mapped to pt-BR user-facing messages:
 *  - `OTP_INVALID`           — wrong code (do NOT zero the input — UX rule)
 *  - `OTP_EXPIRED`           — TTL elapsed
 *  - `OTP_TOO_MANY_ATTEMPTS` — 5th failed attempt — OTP locked
 *  - `OTP_NOT_FOUND`         — no active code for this contractAttemptId
 *  - `OTP_FEATURE_DISABLED`  — flag toggled off mid-session → silent fallback
 *
 * LGPD: the code typed by the user is treated like a credential — never
 * appears in error messages or logs. The backend hashes it before
 * persistence; this client never echoes the plaintext anywhere.
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

export interface VerifyContractOtpInput {
  contractAttemptId: string;
  /** Exactly 6 numeric digits — caller pre-validates the format. */
  code: string;
}

export interface VerifyContractOtpResult {
  verificationToken: string;
  expiresInSeconds: number;
}

// ---------------------------------------------------------------------------
// API error mapping
// ---------------------------------------------------------------------------

async function mapVerifyApiError(res: Response): Promise<Error> {
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

export class VerifyContractOtpUseCase {
  async execute(
    input: VerifyContractOtpInput,
  ): Promise<VerifyContractOtpResult> {
    let res: Response;
    try {
      res = await httpFetch(getApiUrl('/v1/otp/contract/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_attempt_id: input.contractAttemptId,
          code: input.code,
        }),
      });
    } catch {
      throw new ValidationError({ _form: GENERIC_NETWORK_ERROR_MESSAGE });
    }

    if (!res.ok) {
      throw await mapVerifyApiError(res);
    }

    const body = (await res.json()) as {
      verification_token: string;
      expires_in_seconds: number;
    };

    return {
      verificationToken: body.verification_token,
      expiresInSeconds: body.expires_in_seconds,
    };
  }
}
