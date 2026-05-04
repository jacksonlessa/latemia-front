/**
 * Unit tests for generatePaymentUpdateLinkUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * No personal data is included in fixtures.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generatePaymentUpdateLinkUseCase,
  PlanIneligibleForPaymentUpdateError,
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
  it('should throw PlanIneligibleForPaymentUpdateError when API returns 422', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        {
          message:
            'Não é possível gerar link de atualização para planos cancelados, estornados ou contestados.',
        },
        422,
      ),
    );

    await expect(
      generatePaymentUpdateLinkUseCase('plan-uuid-1'),
    ).rejects.toThrow(PlanIneligibleForPaymentUpdateError);
  });

  it('should expose stable code and status on the 422 error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        {
          message:
            'Não é possível gerar link de atualização para planos cancelados, estornados ou contestados.',
        },
        422,
      ),
    );

    try {
      await generatePaymentUpdateLinkUseCase('plan-uuid-1');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PlanIneligibleForPaymentUpdateError);
      const typed = err as PlanIneligibleForPaymentUpdateError;
      expect(typed.code).toBe('PLAN_NOT_ELIGIBLE_FOR_PAYMENT_UPDATE');
      expect(typed.status).toBe(422);
      // Error message must reflect the new eligibility rule and not mention
      // only "inadimplente" — surface the backend message verbatim.
      expect(typed.message).toContain('cancelados');
    }
  });

  it('should preserve PlanNotInadimplenteError as a backward-compatible alias', () => {
    // The class export PlanNotInadimplenteError is kept as an alias to avoid
    // breaking external consumers; both names refer to the same constructor.
    expect(PlanNotInadimplenteError).toBe(PlanIneligibleForPaymentUpdateError);
  });

  it('should fall back to a default message when the 422 body is empty', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({}, 422));

    try {
      await generatePaymentUpdateLinkUseCase('plan-uuid-1');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PlanIneligibleForPaymentUpdateError);
      // Default message must mention the terminal statuses (not "inadimplente").
      expect((err as Error).message).toMatch(
        /cancelados|estornados|contestados/i,
      );
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
