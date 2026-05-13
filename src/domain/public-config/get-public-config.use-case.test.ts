/**
 * Unit tests for `getPublicConfig` use-case.
 *
 * Contract under test (Task 9.0 / techspec §"Frontend"):
 *  - Success path maps snake_case `otp_contract_enabled` → camelCase
 *    `otpContractEnabled` and preserves the boolean value.
 *  - Any error path (non-OK status, network error, timeout/AbortError)
 *    resolves to `{ otpContractEnabled: false }` and the function never
 *    rejects.
 *  - Failure paths emit a single generic `console.warn` without PII.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPublicConfig } from './get-public-config.use-case';

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
  it('should return { otpContractEnabled: true } when backend responds with otp_contract_enabled=true', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ otp_contract_enabled: true }, 200),
    );

    const result = await getPublicConfig();

    expect(result).toEqual({ otpContractEnabled: true });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return { otpContractEnabled: false } when backend responds with otp_contract_enabled=false', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ otp_contract_enabled: false }, 200),
    );

    const result = await getPublicConfig();

    expect(result).toEqual({ otpContractEnabled: false });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should call GET /v1/public-config exactly once', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ otp_contract_enabled: true }, 200),
    );

    await getPublicConfig();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/public-config');
  });
});

describe('getPublicConfig — fail-safe', () => {
  it('should return { otpContractEnabled: false } when backend responds with non-ok status', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({}, 500));

    const result = await getPublicConfig();

    expect(result).toEqual({ otpContractEnabled: false });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should return { otpContractEnabled: false } when fetch rejects with a network error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const result = await getPublicConfig();

    expect(result).toEqual({ otpContractEnabled: false });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should return { otpContractEnabled: false } when fetch is aborted (timeout)', async () => {
    const mockFetch = vi.mocked(fetch);
    const abortError = new DOMException('Aborted', 'AbortError');
    mockFetch.mockRejectedValueOnce(abortError);

    const result = await getPublicConfig();

    expect(result).toEqual({ otpContractEnabled: false });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should treat missing otp_contract_enabled field as false (defensive)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({}, 200));

    const result = await getPublicConfig();

    expect(result).toEqual({ otpContractEnabled: false });
  });

  it('should never include PII or endpoint details in console.warn', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await getPublicConfig();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const args = warnSpy.mock.calls[0];
    // Single string argument, no Error/object/URL leakage.
    expect(args).toHaveLength(1);
    expect(typeof args[0]).toBe('string');
    expect(args[0] as string).not.toMatch(/http/i);
    expect(args[0] as string).not.toMatch(/v1\/public-config/i);
  });
});
