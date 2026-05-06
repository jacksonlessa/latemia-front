/**
 * Unit tests for previewCancelPlanUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * LGPD: no real PII in fixtures — masked data only.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  previewCancelPlanUseCase,
  TokenNotFoundError,
  TokenExpiredError,
  TokenUsedError,
  type CancelPlanPreview,
} from './preview-cancel-plan.use-case';
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

const mockPreview: CancelPlanPreview = {
  clientName: 'J*** L***',
  petName: 'Rex',
  planStatus: 'ativo',
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

describe('previewCancelPlanUseCase — success', () => {
  it('should return CancelPlanPreview when API returns 200', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(mockPreview, 200));

    const result = await previewCancelPlanUseCase('valid-token-uuid');

    expect(result.clientName).toBe('J*** L***');
    expect(result.petName).toBe('Rex');
    expect(result.planStatus).toBe('ativo');
    expect(result.coveredUntil).toBe('2026-06-01T00:00:00.000Z');
  });

  it('should call GET /v1/plan-cancellation/preview with token as query param', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeResponse(mockPreview, 200));

    await previewCancelPlanUseCase('my-token');

    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/plan-cancellation/preview');
    expect(String(url)).toContain('token=my-token');
    expect((init as RequestInit).method).toBe('GET');
    expect((init as RequestInit).cache).toBe('no-store');
  });
});

// ---------------------------------------------------------------------------
// Error: 404 → TokenNotFoundError
// ---------------------------------------------------------------------------

describe('previewCancelPlanUseCase — 404 token not found', () => {
  it('should throw TokenNotFoundError when API returns 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'TOKEN_NOT_FOUND', message: 'Not found' }, 404),
    );

    await expect(previewCancelPlanUseCase('invalid-token')).rejects.toThrow(
      TokenNotFoundError,
    );
  });

  it('should set code TOKEN_NOT_FOUND on the thrown error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'TOKEN_NOT_FOUND' }, 404),
    );

    try {
      await previewCancelPlanUseCase('bad-token');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(TokenNotFoundError);
      expect((err as TokenNotFoundError).code).toBe('TOKEN_NOT_FOUND');
    }
  });
});

// ---------------------------------------------------------------------------
// Error: 410 + TOKEN_EXPIRED → TokenExpiredError
// ---------------------------------------------------------------------------

describe('previewCancelPlanUseCase — 410 token expired', () => {
  it('should throw TokenExpiredError when API returns 410 with TOKEN_EXPIRED', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'TOKEN_EXPIRED', message: 'Token expired' }, 410),
    );

    await expect(previewCancelPlanUseCase('expired-token')).rejects.toThrow(
      TokenExpiredError,
    );
  });

  it('should set code TOKEN_EXPIRED on the thrown error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'TOKEN_EXPIRED' }, 410),
    );

    try {
      await previewCancelPlanUseCase('expired-token');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(TokenExpiredError);
      expect((err as TokenExpiredError).code).toBe('TOKEN_EXPIRED');
    }
  });
});

// ---------------------------------------------------------------------------
// Error: 410 + TOKEN_USED → TokenUsedError
// ---------------------------------------------------------------------------

describe('previewCancelPlanUseCase — 410 token used', () => {
  it('should throw TokenUsedError when API returns 410 with TOKEN_USED', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'TOKEN_USED', message: 'Token already used' }, 410),
    );

    await expect(previewCancelPlanUseCase('used-token')).rejects.toThrow(
      TokenUsedError,
    );
  });

  it('should set code TOKEN_USED on the thrown error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'TOKEN_USED' }, 410),
    );

    try {
      await previewCancelPlanUseCase('used-token');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(TokenUsedError);
      expect((err as TokenUsedError).code).toBe('TOKEN_USED');
    }
  });
});

// ---------------------------------------------------------------------------
// Error: other non-2xx → ApiError
// ---------------------------------------------------------------------------

describe('previewCancelPlanUseCase — other errors', () => {
  it('should throw ApiError when API returns 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'INTERNAL_ERROR', message: 'Server error' }, 500),
    );

    await expect(previewCancelPlanUseCase('some-token')).rejects.toThrow(
      ApiError,
    );
  });

  it('should propagate ApiError status correctly', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeResponse({ code: 'RATE_LIMITED', message: 'Too many requests' }, 429),
    );

    try {
      await previewCancelPlanUseCase('any-token');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(429);
    }
  });
});
