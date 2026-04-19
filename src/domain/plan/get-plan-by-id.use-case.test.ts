/**
 * Unit tests for getPlanByIdUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * No real personal data is included in fixtures.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPlanByIdUseCase } from './get-plan-by-id.use-case';
import { ApiError } from '@/lib/api-errors';
import type { PlanDetail } from '@/lib/types/plan';

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

const mockPlanDetail: PlanDetail = {
  id: 'plan-uuid-1',
  status: 'pendente',
  createdAt: '2026-04-01T10:00:00.000Z',
  pet: {
    name: 'Rex',
    species: 'canino',
    breed: 'Labrador',
    weight: 25,
    castrated: false,
    birthDate: '2022-01-15T00:00:00.000Z',
  },
  client: {
    id: 'client-uuid-1',
    name: 'Maria da Silva',
    email: 'm***@example.com',
    phone: '(**) *****-0001',
  },
  contract: {
    id: 'contract-uuid-1',
    version: 'v1',
    consentedAt: '2026-04-01T09:55:00.000Z',
  },
  payments: [
    {
      id: 'payment-uuid-1',
      status: 'pendente',
      amount: 4990,
      createdAt: '2026-04-01T10:00:00.000Z',
    },
  ],
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  delete process.env.NEXT_PUBLIC_API_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getPlanByIdUseCase — success', () => {
  it('should call GET /v1/plans/:id with Authorization header when token is provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockPlanDetail, 200));

    await getPlanByIdUseCase('plan-uuid-1', 'test-token');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/plans/plan-uuid-1');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-token',
    });
  });

  it('should return plan detail when API responds with 200', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockPlanDetail, 200));

    const result = await getPlanByIdUseCase('plan-uuid-1', 'test-token');

    expect(result.id).toBe('plan-uuid-1');
    expect(result.status).toBe('pendente');
    expect(result.pet.name).toBe('Rex');
    expect(result.client.name).toBe('Maria da Silva');
    expect(result.contract.version).toBe('v1');
    expect(result.payments).toHaveLength(1);
  });
});

describe('getPlanByIdUseCase — error handling', () => {
  it('should throw ApiError with status 404 when plan is not found', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ message: 'Not found' }, 404),
    );

    await expect(
      getPlanByIdUseCase('nonexistent-id', 'test-token'),
    ).rejects.toThrow(ApiError);

    try {
      await getPlanByIdUseCase('nonexistent-id', 'test-token');
    } catch (err) {
      // second call needs a mock
    }
  });

  it('should throw ApiError with 404 code PLAN_NOT_FOUND when API returns 404', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ message: 'Not found' }, 404),
    );

    try {
      await getPlanByIdUseCase('nonexistent-id', 'test-token');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
      expect((err as ApiError).code).toBe('PLAN_NOT_FOUND');
    }
  });

  it('should throw ApiError when API responds with 401', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'UNAUTHORIZED', message: 'Unauthorized' }, 401),
    );

    await expect(
      getPlanByIdUseCase('plan-uuid-1', 'invalid-token'),
    ).rejects.toThrow(ApiError);
  });

  it('should throw when fetch rejects with a network error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      getPlanByIdUseCase('plan-uuid-1', 'test-token'),
    ).rejects.toThrow();
  });
});
