/**
 * Unit tests for generatePaymentUpdateLinkUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * No personal data is included in fixtures.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generatePaymentUpdateLinkUseCase,
  PlanNotInadimplenteError,
  type GenerateTokenResponse,
} from './generate-payment-update-link.use-case';
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

const mockTokenResponse: GenerateTokenResponse = {
  token: 'uuid-token-0001',
  url: 'https://latemia.com.br/atualizar-pagamento?token=uuid-token-0001',
  expiresAt: '2026-05-10T12:00:00.000Z',
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
// Tests
// ---------------------------------------------------------------------------

describe('generatePaymentUpdateLinkUseCase — success', () => {
  it('should return GenerateTokenResponse when API returns 201', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockTokenResponse, 201));

    const result = await generatePaymentUpdateLinkUseCase('plan-uuid-1');

    expect(result.token).toBe('uuid-token-0001');
    expect(result.url).toContain('uuid-token-0001');
    expect(result.expiresAt).toBe('2026-05-10T12:00:00.000Z');
    expect(result.status).toBe('active');
  });
});

describe('generatePaymentUpdateLinkUseCase — error handling', () => {
  it('should throw PlanNotInadimplenteError when API returns 422', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        {
          code: 'PLAN_NOT_INADIMPLENTE',
          message: 'O link só pode ser gerado para planos inadimplentes.',
        },
        422,
      ),
    );

    await expect(
      generatePaymentUpdateLinkUseCase('plan-uuid-1'),
    ).rejects.toThrow(PlanNotInadimplenteError);
  });

  it('should throw PlanNotInadimplenteError with correct code when API returns 422', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        {
          code: 'PLAN_NOT_INADIMPLENTE',
          message: 'O link só pode ser gerado para planos inadimplentes.',
        },
        422,
      ),
    );

    try {
      await generatePaymentUpdateLinkUseCase('plan-uuid-1');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PlanNotInadimplenteError);
      expect((err as PlanNotInadimplenteError).code).toBe('PLAN_NOT_INADIMPLENTE');
      expect((err as PlanNotInadimplenteError).status).toBe(422);
    }
  });

  it('should throw on non-ok response', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'UNAUTHORIZED', message: 'Unauthorized' }, 401),
    );

    await expect(
      generatePaymentUpdateLinkUseCase('plan-uuid-1'),
    ).rejects.toThrow(ApiError);
  });

  it('should throw ApiError with correct status on non-ok response', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'INTERNAL_ERROR', message: 'Server error' }, 500),
    );

    try {
      await generatePaymentUpdateLinkUseCase('plan-uuid-1');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
    }
  });

  it('should throw when fetch rejects with a network error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      generatePaymentUpdateLinkUseCase('plan-uuid-1'),
    ).rejects.toThrow();
  });
});
