/**
 * Unit tests for cancelPlanUseCase.
 *
 * Mocks global `fetch` to test the use case in isolation.
 * No personal data is included in fixtures — only IDs and codes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cancelPlanUseCase,
  PlanAlreadyCancelledError,
  PaymentProviderUnavailableError,
  type CancelPlanResult,
} from './cancel-plan.use-case';
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

const mockCancelResult: CancelPlanResult = {
  coveredUntil: '2026-06-30T23:59:59.000Z',
  cancellationId: 'cancellation-uuid-0001',
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

describe('cancelPlanUseCase — success', () => {
  it('should return CancelPlanResult when API returns 200', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse(mockCancelResult, 200),
    );

    const result = await cancelPlanUseCase({
      planId: 'plan-uuid-1',
      reason: 'Cliente solicitou cancelamento via WhatsApp.',
    });

    expect(result.cancellationId).toBe('cancellation-uuid-0001');
    expect(result.coveredUntil).toBe('2026-06-30T23:59:59.000Z');
  });

  it('should call the correct Route Handler URL', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockCancelResult, 200));

    await cancelPlanUseCase({
      planId: 'plan-uuid-1',
      reason: 'Motivo valido aqui.',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/plans/plan-uuid-1/cancel',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should send reason in request body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockCancelResult, 200));

    const reason = 'Motivo de cancelamento do plano.';
    await cancelPlanUseCase({ planId: 'plan-uuid-1', reason });

    const call = mockFetch.mock.calls[0];
    const init = call[1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({ reason });
  });
});

// ---------------------------------------------------------------------------
// Tests — typed errors
// ---------------------------------------------------------------------------

describe('cancelPlanUseCase — error mapping', () => {
  it('should throw PlanAlreadyCancelledError when API returns 409', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse(
        {
          code: 'PLAN_ALREADY_CANCELLED',
          message: 'Plano já cancelado.',
          cancellationId: 'existing-cancel-id',
        },
        409,
      ),
    );

    await expect(
      cancelPlanUseCase({
        planId: 'plan-uuid-1',
        reason: 'Motivo de cancelamento.',
      }),
    ).rejects.toThrow(PlanAlreadyCancelledError);
  });

  it('should expose correct code on PlanAlreadyCancelledError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'PLAN_ALREADY_CANCELLED', cancellationId: 'existing-id' },
        409,
      ),
    );

    try {
      await cancelPlanUseCase({
        planId: 'plan-uuid-1',
        reason: 'Motivo de cancelamento.',
      });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PlanAlreadyCancelledError);
      const typed = err as PlanAlreadyCancelledError;
      expect(typed.code).toBe('PLAN_ALREADY_CANCELLED');
      expect(typed.status).toBe(409);
      expect(typed.cancellationId).toBe('existing-id');
    }
  });

  it('should throw PaymentProviderUnavailableError when API returns 503', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse(
        {
          code: 'PAYMENT_PROVIDER_UNAVAILABLE',
          message: 'Pagar.me timeout.',
        },
        503,
      ),
    );

    await expect(
      cancelPlanUseCase({
        planId: 'plan-uuid-1',
        reason: 'Motivo de cancelamento.',
      }),
    ).rejects.toThrow(PaymentProviderUnavailableError);
  });

  it('should expose correct code on PaymentProviderUnavailableError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: 'PAYMENT_PROVIDER_UNAVAILABLE' }, 503),
    );

    try {
      await cancelPlanUseCase({
        planId: 'plan-uuid-1',
        reason: 'Motivo de cancelamento.',
      });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PaymentProviderUnavailableError);
      const typed = err as PaymentProviderUnavailableError;
      expect(typed.code).toBe('PROVIDER_UNAVAILABLE');
      expect(typed.status).toBe(503);
    }
  });

  it('should throw ApiError for other non-ok responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: 'UNAUTHENTICATED', message: 'Sessão expirada.' }, 401),
    );

    await expect(
      cancelPlanUseCase({
        planId: 'plan-uuid-1',
        reason: 'Motivo de cancelamento.',
      }),
    ).rejects.toThrow(ApiError);
  });

  it('should throw ApiError with correct status on 400', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'INVALID_REASON', message: 'Motivo muito curto.' },
        400,
      ),
    );

    try {
      await cancelPlanUseCase({
        planId: 'plan-uuid-1',
        reason: 'curto',
      });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(400);
    }
  });

  it('should throw when fetch rejects with a network error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      cancelPlanUseCase({
        planId: 'plan-uuid-1',
        reason: 'Motivo de cancelamento.',
      }),
    ).rejects.toThrow();
  });
});
