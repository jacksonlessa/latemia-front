/**
 * Unit tests for `getPublicConfig` use-case.
 *
 * Contract under test:
 *  - Success path maps snake_case `otp_contract_enabled` / `subscription_plan_price_cents`
 *    → camelCase `otpContractEnabled` / `pricePerPetCents`.
 *  - Invalid or missing `subscription_plan_price_cents` falls back to
 *    `FALLBACK_PRICE_PER_PET_CENTS` — never propagates `null`.
 *  - Any error path (non-OK status, network error, timeout/AbortError)
 *    resolves to the default config and the function never rejects.
 *  - Failure paths emit a single generic `console.warn` without PII.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPublicConfig,
  FALLBACK_PRICE_PER_PET_CENTS,
} from './get-public-config.use-case';

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('getPublicConfig — success', () => {
  it('should map otp_contract_enabled and subscription_plan_price_cents from the backend payload', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { otp_contract_enabled: true, subscription_plan_price_cents: 4990 },
        200,
      ),
    );

    const result = await getPublicConfig();

    expect(result).toEqual({
      otpContractEnabled: true,
      pricePerPetCents: 4990,
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return otpContractEnabled=false when backend reports false', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { otp_contract_enabled: false, subscription_plan_price_cents: 2500 },
        200,
      ),
    );

    const result = await getPublicConfig();

    expect(result.otpContractEnabled).toBe(false);
    expect(result.pricePerPetCents).toBe(2500);
  });

  it('should fall back to FALLBACK_PRICE_PER_PET_CENTS when backend returns null for the price', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { otp_contract_enabled: true, subscription_plan_price_cents: null },
        200,
      ),
    );

    const result = await getPublicConfig();

    expect(result.pricePerPetCents).toBe(FALLBACK_PRICE_PER_PET_CENTS);
    expect(result.otpContractEnabled).toBe(true);
  });

  it.each([0, -10, 1.5, NaN])(
    'should fall back to FALLBACK_PRICE_PER_PET_CENTS when backend price is invalid (%p)',
    async (invalid) => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce(
        makeFetchResponse(
          {
            otp_contract_enabled: false,
            subscription_plan_price_cents: invalid,
          },
          200,
        ),
      );

      const result = await getPublicConfig();

      expect(result.pricePerPetCents).toBe(FALLBACK_PRICE_PER_PET_CENTS);
    },
  );

  it('should call GET /v1/public-config exactly once', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { otp_contract_enabled: true, subscription_plan_price_cents: 2500 },
        200,
      ),
    );

    await getPublicConfig();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/public-config');
  });
});

describe('getPublicConfig — fail-safe', () => {
  it('should return default config when backend responds with non-ok status', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({}, 500));

    const result = await getPublicConfig();

    expect(result).toEqual({
      otpContractEnabled: false,
      pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS,
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should return default config when fetch rejects with a network error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await getPublicConfig();

    expect(result).toEqual({
      otpContractEnabled: false,
      pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS,
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should return default config when fetch is aborted (timeout)', async () => {
    const mockFetch = vi.mocked(fetch);
    const abortError = new DOMException('Aborted', 'AbortError');
    mockFetch.mockRejectedValueOnce(abortError);

    const result = await getPublicConfig();

    expect(result).toEqual({
      otpContractEnabled: false,
      pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS,
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should treat missing fields as defaults (defensive)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({}, 200));

    const result = await getPublicConfig();

    expect(result).toEqual({
      otpContractEnabled: false,
      pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS,
    });
  });

  it('should never include PII or endpoint details in console.warn', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await getPublicConfig();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const args = warnSpy.mock.calls[0];
    expect(args).toHaveLength(1);
    expect(typeof args[0]).toBe('string');
    expect(args[0] as string).not.toMatch(/http/i);
    expect(args[0] as string).not.toMatch(/v1\/public-config/i);
  });
});
