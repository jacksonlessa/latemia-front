/**
 * ResendContractOtpUseCase
 *
 * Calls `POST /v1/otp/contract/resend` when the cooldown window has elapsed
 * and the user explicitly asked for a new code. Same error mapping and
 * response shape as `RequestContractOtpUseCase` — kept as a sibling use-case
 * so the FE state machine can dispatch each click distinctly (telemetry
 * later may want to count resends separately from initial requests).
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
// Types — identical shape to the request use-case
// ---------------------------------------------------------------------------

export interface ResendContractOtpInput {
  contractAttemptId: string;
  /** E.164 BR phone (`+55XXXXXXXXXXX`). */
  phone: string;
}

export interface ResendContractOtpResult {
  phoneMasked: string;
  expiresInSeconds: number;
  cooldownSeconds: number;
}

// ---------------------------------------------------------------------------
// API error mapping
// ---------------------------------------------------------------------------

async function mapResendApiError(res: Response): Promise<Error> {
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

export class ResendContractOtpUseCase {
  async execute(
    input: ResendContractOtpInput,
  ): Promise<ResendContractOtpResult> {
    let res: Response;
    try {
      res = await httpFetch(getApiUrl('/v1/otp/contract/resend'), {
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
      throw await mapResendApiError(res);
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
