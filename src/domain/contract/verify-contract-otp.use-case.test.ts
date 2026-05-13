/**
 * Unit tests for VerifyContractOtpUseCase.
 *
 * Pins the contract:
 *  - 200 OK → camelCase result with verificationToken
 *  - Each documented OTP error code is mapped to its pt-BR message
 *  - OTP_FEATURE_DISABLED routes to FeatureDisabledError
 *  - Network errors collapse to a generic ValidationError
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VerifyContractOtpUseCase } from './verify-contract-otp.use-case';
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
  code: '123456',
};

const SUCCESS_BODY = {
  verified: true,
  verification_token: 'tok_abc-uuid',
  expires_in_seconds: 300,
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('VerifyContractOtpUseCase — success', () => {
  it('should return verificationToken and expiresInSeconds when API responds 200', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeFetchResponse(SUCCESS_BODY, 200));

    const result = await new VerifyContractOtpUseCase().execute(VALID_INPUT);

    expect(result).toEqual({
      verificationToken: 'tok_abc-uuid',
      expiresInSeconds: 300,
    });
  });

  it('should call POST /v1/otp/contract/verify with snake_case payload', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(SUCCESS_BODY, 200));

    await new VerifyContractOtpUseCase().execute(VALID_INPUT);

    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/otp/contract/verify');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({
      contract_attempt_id: VALID_INPUT.contractAttemptId,
      code: VALID_INPUT.code,
    });
  });
});

describe('VerifyContractOtpUseCase — error mapping', () => {
  const cases: Array<{ code: string; status: number; expected: string }> = [
    {
      code: 'OTP_INVALID',
      status: 400,
      expected: 'Código incorreto. Verifique e tente novamente.',
    },
    {
      code: 'OTP_EXPIRED',
      status: 410,
      expected: 'Código expirado. Solicite um novo.',
    },
    {
      code: 'OTP_TOO_MANY_ATTEMPTS',
      status: 429,
      expected: 'Muitas tentativas. Solicite um novo código.',
    },
    {
      code: 'OTP_NOT_FOUND',
      status: 404,
      expected: 'Código não encontrado. Solicite um novo.',
    },
  ];

  cases.forEach(({ code, status, expected }) => {
    it(`should map ${code} to ValidationError with expected message`, async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        makeFetchResponse({ code }, status),
      );

      try {
        await new VerifyContractOtpUseCase().execute(VALID_INPUT);
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        expect((e as ValidationError).fieldErrors._form).toBe(expected);
        expect((e as ValidationError).fieldErrors._code).toBe(code);
      }
    });
  });

  it('should map OTP_FEATURE_DISABLED to FeatureDisabledError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: 'OTP_FEATURE_DISABLED' }, 409),
    );

    await expect(
      new VerifyContractOtpUseCase().execute(VALID_INPUT),
    ).rejects.toThrow(FeatureDisabledError);
  });

  it('should map network failure to generic ValidationError', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    try {
      await new VerifyContractOtpUseCase().execute(VALID_INPUT);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors._form).toBe(
        'Erro de conexão. Tente novamente.',
      );
    }
  });
});
