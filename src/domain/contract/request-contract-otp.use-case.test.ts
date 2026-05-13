/**
 * Unit tests for RequestContractOtpUseCase.
 *
 * Covers the canonical contract for the OTP request endpoint:
 *  - Snake_case ↔ camelCase mapping of response body
 *  - Mapping of every documented backend error code to a user-facing message
 *  - `OTP_FEATURE_DISABLED` → `FeatureDisabledError` (separate error type)
 *  - Network failure → ValidationError with the generic message
 *
 * LGPD: never asserts on personal data; mocks `fetch` globally.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestContractOtpUseCase } from './request-contract-otp.use-case';
import { ValidationError } from '@/lib/validation-error';
import { FeatureDisabledError } from '@/lib/feature-disabled-error';

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const VALID_INPUT = {
  contractAttemptId: '11111111-2222-3333-4444-555555555555',
  phone: '+5511987654321',
};

const SUCCESS_BODY = {
  phone_masked: '(11) 9****-4321',
  expires_in_seconds: 600,
  cooldown_seconds: 60,
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('RequestContractOtpUseCase — success', () => {
  it('should return camelCase fields when API responds 201', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeFetchResponse(SUCCESS_BODY, 201));

    const result = await new RequestContractOtpUseCase().execute(VALID_INPUT);

    expect(result).toEqual({
      phoneMasked: '(11) 9****-4321',
      expiresInSeconds: 600,
      cooldownSeconds: 60,
    });
  });

  it('should call POST /v1/otp/contract/request with snake_case payload', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(SUCCESS_BODY, 201));

    await new RequestContractOtpUseCase().execute(VALID_INPUT);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/otp/contract/request');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({
      contract_attempt_id: VALID_INPUT.contractAttemptId,
      phone: VALID_INPUT.phone,
    });
  });
});

describe('RequestContractOtpUseCase — error mapping', () => {
  const cases: Array<{ code: string; status: number; expected: string }> = [
    {
      code: 'OTP_COOLDOWN_ACTIVE',
      status: 429,
      expected: 'Aguarde antes de reenviar.',
    },
    {
      code: 'SMS_PROVIDER_UNAVAILABLE',
      status: 503,
      expected:
        'Não conseguimos enviar o SMS agora. Tente em alguns instantes.',
    },
  ];

  cases.forEach(({ code, status, expected }) => {
    it(`should map ${code} to a user-facing ValidationError`, async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        makeFetchResponse({ code }, status),
      );

      await expect(
        new RequestContractOtpUseCase().execute(VALID_INPUT),
      ).rejects.toThrow(ValidationError);

      vi.mocked(fetch).mockResolvedValueOnce(
        makeFetchResponse({ code }, status),
      );
      try {
        await new RequestContractOtpUseCase().execute(VALID_INPUT);
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        expect((e as ValidationError).fieldErrors._form).toBe(expected);
        expect((e as ValidationError).fieldErrors._code).toBe(code);
      }
    });
  });

  it('should map OTP_FEATURE_DISABLED to FeatureDisabledError (not ValidationError)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: 'OTP_FEATURE_DISABLED' }, 409),
    );

    await expect(
      new RequestContractOtpUseCase().execute(VALID_INPUT),
    ).rejects.toThrow(FeatureDisabledError);
  });

  it('should map unknown error code to generic network error message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: 'WHAT_IS_THIS' }, 500),
    );

    try {
      await new RequestContractOtpUseCase().execute(VALID_INPUT);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors._form).toBe(
        'Erro de conexão. Tente novamente.',
      );
    }
  });

  it('should map network failure to ValidationError with generic message', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    try {
      await new RequestContractOtpUseCase().execute(VALID_INPUT);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors._form).toBe(
        'Erro de conexão. Tente novamente.',
      );
    }
  });
});
