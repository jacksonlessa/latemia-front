/**
 * Unit tests for deactivatePetUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * No personal data is included in fixtures or assertions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  deactivatePetUseCase,
  PetHasPlansError,
  ApiNotFoundError,
} from './deactivate-pet.use-case';
import { ApiError } from '@/lib/api-errors';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLIENT_ID = 'client-uuid-1';
const PET_ID = 'pet-uuid-1';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetchResponse(body: unknown, status: number): Response {
  const bodyStr = body === null ? '' : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () =>
      bodyStr
        ? Promise.resolve(JSON.parse(bodyStr))
        : Promise.reject(new SyntaxError('Unexpected end of JSON input')),
  } as unknown as Response;
}

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
// 204 — success
// ---------------------------------------------------------------------------

describe('deactivatePetUseCase — 204 success', () => {
  it('should resolve void on 204 response', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(null, 204));

    const result = await deactivatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID });

    expect(result).toBeUndefined();
  });

  it('should call DELETE /api/admin/clients/:clientId/pets/:petId', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(null, 204));

    await deactivatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain(`/api/admin/clients/${CLIENT_ID}/pets/${PET_ID}`);
    expect((init as RequestInit).method).toBe('DELETE');
  });
});

// ---------------------------------------------------------------------------
// 409 — PET_HAS_PLANS
// ---------------------------------------------------------------------------

describe('deactivatePetUseCase — 409 PET_HAS_PLANS', () => {
  it('should throw PetHasPlansError on 409 with code PET_HAS_PLANS', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'PET_HAS_PLANS', message: 'Pet possui planos associados.' },
        409,
      ),
    );

    await expect(
      deactivatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID }),
    ).rejects.toBeInstanceOf(PetHasPlansError);
  });

  it('should include PET_HAS_PLANS code on the thrown error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'PET_HAS_PLANS', message: 'Pet possui planos associados.' },
        409,
      ),
    );

    try {
      await deactivatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID });
    } catch (err) {
      expect(err).toBeInstanceOf(PetHasPlansError);
      expect((err as PetHasPlansError).code).toBe('PET_HAS_PLANS');
    }
  });

  it('should throw ApiError on 409 with a different code', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'OTHER_CONFLICT', message: 'Conflict.' }, 409),
    );

    await expect(
      deactivatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

// ---------------------------------------------------------------------------
// 404 — not found
// ---------------------------------------------------------------------------

describe('deactivatePetUseCase — 404 not found', () => {
  it('should throw ApiNotFoundError on 404', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'NOT_FOUND', message: 'Pet não encontrado' }, 404),
    );

    await expect(
      deactivatePetUseCase({ clientId: CLIENT_ID, petId: 'ghost-id' }),
    ).rejects.toBeInstanceOf(ApiNotFoundError);
  });

  it('should throw ApiNotFoundError when pet does not belong to the given clientId', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'NOT_FOUND', message: 'Pet não pertence ao cliente' }, 404),
    );

    await expect(
      deactivatePetUseCase({ clientId: 'other-client', petId: PET_ID }),
    ).rejects.toBeInstanceOf(ApiNotFoundError);
  });
});

// ---------------------------------------------------------------------------
// 500 — unexpected server error
// ---------------------------------------------------------------------------

describe('deactivatePetUseCase — 500 server error', () => {
  it('should throw ApiError on 500', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500),
    );

    await expect(
      deactivatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('should include the HTTP status in the thrown ApiError', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500),
    );

    try {
      await deactivatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
    }
  });
});
