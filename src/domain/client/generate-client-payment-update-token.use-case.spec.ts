/**
 * Unit tests for generateClientPaymentUpdateTokenUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * No personal data is included in fixtures.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateClientPaymentUpdateTokenUseCase,
  ClientIneligibleForPaymentUpdateError,
  type GenerateClientTokenResponse,
} from './generate-client-payment-update-token.use-case';
import { ApiError } from '@/lib/api-errors';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const mockTokenResponse: GenerateClientTokenResponse = {
  token: 'uuid-client-token-0001',
  url: 'https://latemia.com.br/atualizar-pagamento?token=uuid-client-token-0001',
  expiresAt: '2026-05-14T12:00:00.000Z',
  status: 'active',
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests — success
// ---------------------------------------------------------------------------

describe('generateClientPaymentUpdateTokenUseCase — success', () => {
  it('should return GenerateClientTokenResponse when API returns 201', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockTokenResponse, 201));

    const result =
      await generateClientPaymentUpdateTokenUseCase('client-uuid-1');

    expect(result.token).toBe('uuid-client-token-0001');
    expect(result.url).toContain('uuid-client-token-0001');
    expect(result.expiresAt).toBe('2026-05-14T12:00:00.000Z');
    expect(result.status).toBe('active');
  });

  it('should call the correct route handler URL', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockTokenResponse, 201));

    await generateClientPaymentUpdateTokenUseCase('client-uuid-1');

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/api/admin/clients/client-uuid-1/payment-update-token');
  });

  it('should use POST method', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockTokenResponse, 201));

    await generateClientPaymentUpdateTokenUseCase('client-uuid-1');

    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).method).toBe('POST');
  });

  it('should encode clientId in the URL', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockTokenResponse, 201));

    await generateClientPaymentUpdateTokenUseCase('client/with/slashes');

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).not.toContain('client/with/slashes');
    expect(String(url)).toContain('client%2Fwith%2Fslashes');
  });
});

// ---------------------------------------------------------------------------
// Tests — error handling
// ---------------------------------------------------------------------------

describe('generateClientPaymentUpdateTokenUseCase — error handling', () => {
  it('should throw ClientIneligibleForPaymentUpdateError when API returns 422', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        {
          message:
            'O cliente não possui planos elegíveis para atualização de pagamento.',
        },
        422,
      ),
    );

    await expect(
      generateClientPaymentUpdateTokenUseCase('client-uuid-1'),
    ).rejects.toThrow(ClientIneligibleForPaymentUpdateError);
  });

  it('should expose stable code and status on the 422 error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        {
          message:
            'O cliente não possui planos elegíveis para atualização de pagamento.',
        },
        422,
      ),
    );

    try {
      await generateClientPaymentUpdateTokenUseCase('client-uuid-1');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ClientIneligibleForPaymentUpdateError);
      const typed = err as ClientIneligibleForPaymentUpdateError;
      expect(typed.code).toBe('CLIENT_NOT_ELIGIBLE_FOR_PAYMENT_UPDATE');
      expect(typed.status).toBe(422);
    }
  });

  it('should fall back to a default message when the 422 body is empty', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({}, 422));

    try {
      await generateClientPaymentUpdateTokenUseCase('client-uuid-1');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ClientIneligibleForPaymentUpdateError);
      // Default message must mention terminal statuses
      expect((err as Error).message).toMatch(
        /cancelados|estornados|contestados/i,
      );
    }
  });

  it('should throw ApiError on 401', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'UNAUTHENTICATED', message: 'Sessão expirada.' }, 401),
    );

    await expect(
      generateClientPaymentUpdateTokenUseCase('client-uuid-1'),
    ).rejects.toThrow(ApiError);
  });

  it('should throw ApiError with correct status on 500', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'INTERNAL_ERROR', message: 'Server error' }, 500),
    );

    try {
      await generateClientPaymentUpdateTokenUseCase('client-uuid-1');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
    }
  });

  it('should propagate network errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      generateClientPaymentUpdateTokenUseCase('client-uuid-1'),
    ).rejects.toThrow();
  });
});
