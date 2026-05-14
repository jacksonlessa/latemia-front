/**
 * Unit tests for ResendContractOtpUseCase.
 *
 * Identical contract to the request use-case; tests pin the
 * `/v1/otp/contract/resend` endpoint and the cooldown error mapping.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResendContractOtpUseCase } from './resend-contract-otp.use-case';
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

describe('ResendContractOtpUseCase — success', () => {
  it('should call POST /v1/otp/contract/resend and return camelCase fields', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(SUCCESS_BODY, 201));

    const result = await new ResendContractOtpUseCase().execute(VALID_INPUT);

    expect(result).toEqual({
      phoneMasked: '(11) 9****-4321',
      expiresInSeconds: 600,
      cooldownSeconds: 60,
    });
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/otp/contract/resend');
  });
});

describe('ResendContractOtpUseCase — error mapping', () => {
  it('should map OTP_COOLDOWN_ACTIVE to ValidationError with cooldown message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: 'OTP_COOLDOWN_ACTIVE' }, 429),
    );

    try {
      await new ResendContractOtpUseCase().execute(VALID_INPUT);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors._form).toBe(
        'Aguarde antes de reenviar.',
      );
      expect((e as ValidationError).fieldErrors._code).toBe(
        'OTP_COOLDOWN_ACTIVE',
      );
    }
  });

  it('should map SMS_PROVIDER_UNAVAILABLE to ValidationError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: 'SMS_PROVIDER_UNAVAILABLE' }, 503),
    );

    try {
      await new ResendContractOtpUseCase().execute(VALID_INPUT);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors._form).toContain('SMS');
    }
  });

  it('should map OTP_FEATURE_DISABLED to FeatureDisabledError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: 'OTP_FEATURE_DISABLED' }, 409),
    );

    await expect(
      new ResendContractOtpUseCase().execute(VALID_INPUT),
    ).rejects.toThrow(FeatureDisabledError);
  });

  it('should map network failure to generic ValidationError', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    try {
      await new ResendContractOtpUseCase().execute(VALID_INPUT);
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors._form).toBe(
        'Erro de conexão. Tente novamente.',
      );
    }
  });
});
