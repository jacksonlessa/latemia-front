/**
 * Unit tests for listPlansUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * No personal data is included in fixtures.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listPlansUseCase } from './list-plans.use-case';
import type { PlanListResponse } from '@/lib/types/plan';

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

const mockResponse: PlanListResponse = {
  data: [
    {
      id: 'plan-uuid-1',
      status: 'pendente',
      clientId: 'client-uuid-1',
      clientName: 'Maria da Silva',
      petName: 'Rex',
      createdAt: '2026-04-01T10:00:00.000Z',
    },
    {
      id: 'plan-uuid-2',
      status: 'ativo',
      clientId: 'client-uuid-2',
      clientName: 'João Souza',
      petName: 'Luna',
      createdAt: '2026-03-15T08:30:00.000Z',
    },
  ],
  meta: {
    total: 2,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
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

describe('listPlansUseCase — success', () => {
  it('should call GET /v1/plans with Authorization header when token is provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockResponse, 200));

    await listPlansUseCase({ token: 'test-token' });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/plans');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-token',
    });
  });

  it('should return paginated plan list when API responds with 200', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockResponse, 200));

    const result = await listPlansUseCase({ token: 'test-token' });

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(result.meta.page).toBe(1);
  });

  it('should include page and perPage query params when provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockResponse, 200));

    await listPlansUseCase({ token: 'test-token', page: 2, perPage: 10 });

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('page=2');
    expect(String(url)).toContain('perPage=10');
  });

  it('should include status query param when status filter is provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockResponse, 200));

    await listPlansUseCase({ token: 'test-token', status: 'ativo' });

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('status=ativo');
  });

  it('should include search query param when search is provided', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockResponse, 200));

    await listPlansUseCase({ token: 'test-token', search: 'Rex' });

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('search=Rex');
  });

  it('should not include search query param when search is empty string', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockResponse, 200));

    await listPlansUseCase({ token: 'test-token', search: '' });

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).not.toContain('search=');
  });
});

describe('listPlansUseCase — error handling', () => {
  it('should throw an error when API responds with non-OK status', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ message: 'Unauthorized' }, 401));

    await expect(
      listPlansUseCase({ token: 'invalid-token' }),
    ).rejects.toThrow('Failed to fetch plans: HTTP 401');
  });

  it('should throw an error when fetch throws a network error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      listPlansUseCase({ token: 'test-token' }),
    ).rejects.toThrow();
  });
});
