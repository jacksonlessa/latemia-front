/**
 * Unit tests for fetchPetDetailUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * No personal data is included in fixtures.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPetDetailUseCase,
  FetchPetDetailError,
} from './fetch-pet-detail.use-case';
import type { PetDetail } from '@/lib/types/pet';

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const mockPet: PetDetail = {
  id: 'pet-uuid-1',
  clientId: 'client-uuid-1',
  name: 'Rex',
  species: 'canino',
  breed: 'Labrador',
  birthDate: '2021-01-01T00:00:00.000Z',
  sex: 'male',
  weight: 28.5,
  castrated: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  delete process.env.NEXT_PUBLIC_API_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchPetDetailUseCase — success', () => {
  it('should call GET /v1/clients/:clientId/pets/:petId with Authorization header', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockPet, 200));

    await fetchPetDetailUseCase({
      clientId: 'client-uuid-1',
      petId: 'pet-uuid-1',
      token: 'test-token',
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/clients/client-uuid-1/pets/pet-uuid-1');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-token',
    });
  });

  it('should return PetDetail when API responds with 200', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockPet, 200));

    const result = await fetchPetDetailUseCase({
      clientId: 'client-uuid-1',
      petId: 'pet-uuid-1',
      token: 'test-token',
    });

    expect(result.id).toBe('pet-uuid-1');
    expect(result.clientId).toBe('client-uuid-1');
    expect(result.species).toBe('canino');
  });
});

describe('fetchPetDetailUseCase — error handling', () => {
  it('should throw FetchPetDetailError with status 404 when API responds 404', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ message: 'Not found' }, 404),
    );

    await expect(
      fetchPetDetailUseCase({
        clientId: 'client-uuid-1',
        petId: 'ghost-uuid',
        token: 'test-token',
      }),
    ).rejects.toMatchObject({
      name: 'FetchPetDetailError',
      status: 404,
    });
  });

  it('should propagate network errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      fetchPetDetailUseCase({
        clientId: 'client-uuid-1',
        petId: 'pet-uuid-1',
        token: 'test-token',
      }),
    ).rejects.toThrow();
  });

  it('FetchPetDetailError keeps the HTTP status accessible', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ message: 'Forbidden' }, 403),
    );

    try {
      await fetchPetDetailUseCase({
        clientId: 'client-uuid-1',
        petId: 'pet-uuid-1',
        token: 'test-token',
      });
      throw new Error('expected to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(FetchPetDetailError);
      expect((err as FetchPetDetailError).status).toBe(403);
    }
  });
});
