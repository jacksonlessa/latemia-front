/**
 * Unit tests for cancelPlanWithTokenUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * LGPD: no real PII in fixtures.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cancelPlanWithTokenUseCase,
  TokenExpiredError,
  TokenUsedError,
  PaymentProviderUnavailableError,
  type CancelPlanWithTokenResult,
} from './cancel-plan-with-token.use-case';
import { ApiError } from '@/lib/api-errors';

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

const mockResult: CancelPlanWithTokenResult = {
  coveredUntil: '2026-06-01T00:00:00.000Z',
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

describe('cancelPlanWithTokenUseCase — success', () => {
  it('should return CancelPlanWithTokenResult when API returns 200', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(mockResult, 200));

    const result = await cancelPlanWithTokenUseCase({
      token: 'valid-token',
      reason: 'Motivo do cancelamento valido',
    });

    expect(result.coveredUntil).toBe('2026-06-01T00:00:00.000Z');
  });

  it('should call POST /v1/plan-cancellation/consume with token and reason', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeResponse(mockResult, 200));

    await cancelPlanWithTokenUseCase({
      token: 'my-cancel-token',
      reason: 'Motivo de cancelamento',
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/plan-cancellation/consume');
    expect((init as RequestInit).method).toBe('POST');

    const body = JSON.parse((init as RequestInit).body as string) as {
      token: string;
      reason: string;
    };
    expect(body.token).toBe('my-cancel-token');
    expect(body.reason).toBe('Motivo de cancelamento');
  });

  it('should handle null coveredUntil when plan never had a paid cycle', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ coveredUntil: null }, 200),
    );

    const result = await cancelPlanWithTokenUseCase({
      token: 'valid-token',
      reason: 'Cancelando sem ciclo pago',
    });

    expect(result.coveredUntil).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Error: 410 → typed errors
// ---------------------------------------------------------------------------

describe('cancelPlanWithTokenUseCase — 410 token expired', () => {
  it('should throw TokenExpiredError when API returns 410 with TOKEN_EXPIRED', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'TOKEN_EXPIRED', message: 'Token expired' }, 410),
    );

    await expect(
      cancelPlanWithTokenUseCase({ token: 'expired', reason: 'some reason here' }),
    ).rejects.toThrow(TokenExpiredError);
  });
});

describe('cancelPlanWithTokenUseCase — 410 token used', () => {
  it('should throw TokenUsedError when API returns 410 with TOKEN_USED', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'TOKEN_USED', message: 'Already used' }, 410),
    );

    await expect(
      cancelPlanWithTokenUseCase({ token: 'used', reason: 'some reason here' }),
    ).rejects.toThrow(TokenUsedError);
  });

  it('should set correct error code on TokenUsedError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'TOKEN_USED' }, 410),
    );

    try {
      await cancelPlanWithTokenUseCase({ token: 'used', reason: 'some reason here' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(TokenUsedError);
      expect((err as TokenUsedError).code).toBe('TOKEN_USED');
    }
  });
});

// ---------------------------------------------------------------------------
// Error: 503 → PaymentProviderUnavailableError
// ---------------------------------------------------------------------------

describe('cancelPlanWithTokenUseCase — 503 payment provider unavailable', () => {
  it('should throw PaymentProviderUnavailableError when API returns 503', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse(
        { code: 'PAYMENT_PROVIDER_UNAVAILABLE', message: 'Gateway timeout' },
        503,
      ),
    );

    await expect(
      cancelPlanWithTokenUseCase({ token: 'tok', reason: 'some reason here' }),
    ).rejects.toThrow(PaymentProviderUnavailableError);
  });

  it('should set correct code on PaymentProviderUnavailableError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'PAYMENT_PROVIDER_UNAVAILABLE' }, 503),
    );

    try {
      await cancelPlanWithTokenUseCase({ token: 'tok', reason: 'some reason here' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PaymentProviderUnavailableError);
      expect((err as PaymentProviderUnavailableError).code).toBe(
        'PAYMENT_PROVIDER_UNAVAILABLE',
      );
    }
  });

  it('should use default message when 503 body is empty', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({}, 503));

    try {
      await cancelPlanWithTokenUseCase({ token: 'tok', reason: 'some reason here' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PaymentProviderUnavailableError);
      expect((err as Error).message).toMatch(/temporariamente indispon/i);
    }
  });
});

// ---------------------------------------------------------------------------
// Error: other non-2xx → ApiError
// ---------------------------------------------------------------------------

describe('cancelPlanWithTokenUseCase — other errors', () => {
  it('should throw ApiError when API returns 400', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'INVALID_REASON', message: 'Reason too short' }, 400),
    );

    await expect(
      cancelPlanWithTokenUseCase({ token: 'tok', reason: 'short' }),
    ).rejects.toThrow(ApiError);
  });

  it('should propagate ApiError status on 500 response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'INTERNAL_ERROR', message: 'Server error' }, 500),
    );

    try {
      await cancelPlanWithTokenUseCase({ token: 'tok', reason: 'some reason here' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
    }
  });
});
