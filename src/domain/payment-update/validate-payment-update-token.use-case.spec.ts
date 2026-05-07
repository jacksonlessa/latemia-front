/**
 * Unit tests for validatePaymentUpdateToken use-case.
 *
 * Mocks the global fetch to test the use-case in isolation.
 * LGPD: no PII is used in fixtures or assertions — only masked name and pet names.
 *
 * Model: 1 client = 1 subscription with N items (pivô subscription consolidada).
 * TokenContext now carries tutorMaskedName + petsCovered[] instead of petName/planStatus.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validatePaymentUpdateToken,
  TokenInvalidError,
} from './validate-payment-update-token.use-case';
import type { TokenContext } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const tokenContextSinglePet: TokenContext = {
  tutorMaskedName: 'J** S***',
  petsCovered: ['Rex'],
  chargesBehavior: 'immediate',
};

const tokenContextMultiplePets: TokenContext = {
  tutorMaskedName: 'M**** O****',
  petsCovered: ['Luna', 'Thor', 'Mel'],
  chargesBehavior: 'next_cycle',
};

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe('validatePaymentUpdateToken — success', () => {
  it('should return token context with tutorMaskedName and petsCovered when token is valid', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(tokenContextSinglePet, 200));

    const result = await validatePaymentUpdateToken('valid-token');

    expect(result).toEqual(tokenContextSinglePet);
    expect(result.tutorMaskedName).toBe('J** S***');
    expect(result.petsCovered).toEqual(['Rex']);
    expect(result.chargesBehavior).toBe('immediate');
  });

  it('should return multiple petsCovered when client has multiple plans', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(tokenContextMultiplePets, 200));

    const result = await validatePaymentUpdateToken('valid-token');

    expect(result.petsCovered).toHaveLength(3);
    expect(result.petsCovered).toEqual(['Luna', 'Thor', 'Mel']);
    expect(result.chargesBehavior).toBe('next_cycle');
  });

  it('should call GET /api/public/payment-update/:token', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeResponse(tokenContextSinglePet, 200));

    await validatePaymentUpdateToken('abc123');

    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/api/public/payment-update/abc123');
    expect((init as RequestInit).method).toBe('GET');
    expect((init as RequestInit).cache).toBe('no-store');
  });

  it('should not expose CPF, email, or phone in the returned context', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(tokenContextSinglePet, 200));

    const result = await validatePaymentUpdateToken('valid-token');

    expect(result).not.toHaveProperty('cpf');
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('phone');
    expect(result).not.toHaveProperty('petName');
    expect(result).not.toHaveProperty('planStatus');
  });
});

// ---------------------------------------------------------------------------
// Token invalid / expired / used
// ---------------------------------------------------------------------------

describe('validatePaymentUpdateToken — token invalid', () => {
  it('should throw TokenInvalidError when API returns 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ message: 'Not found' }, 404));

    await expect(validatePaymentUpdateToken('expired-token')).rejects.toThrow(
      TokenInvalidError,
    );
  });

  it('should set code TOKEN_INVALID on the thrown error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ message: 'Not found' }, 404));

    try {
      await validatePaymentUpdateToken('used-token');
    } catch (e) {
      expect((e as TokenInvalidError).code).toBe('TOKEN_INVALID');
    }
  });
});

// ---------------------------------------------------------------------------
// Network error
// ---------------------------------------------------------------------------

describe('validatePaymentUpdateToken — network error', () => {
  it('should throw TokenInvalidError on network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(validatePaymentUpdateToken('any-token')).rejects.toThrow(Error);
  });

  it('should throw an error with message NETWORK_ERROR when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    try {
      await validatePaymentUpdateToken('any-token');
    } catch (e) {
      expect((e as Error).message).toBe('NETWORK_ERROR');
    }
  });
});

// ---------------------------------------------------------------------------
// Unexpected HTTP errors
// ---------------------------------------------------------------------------

describe('validatePaymentUpdateToken — unexpected HTTP errors', () => {
  it('should throw an error with code HTTP_500 when API returns 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ message: 'Server error' }, 500));

    try {
      await validatePaymentUpdateToken('any-token');
    } catch (e) {
      expect((e as Error).message).toBe('HTTP_500');
    }
  });
});
