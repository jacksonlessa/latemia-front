/**
 * Unit tests for updatePetUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * No personal data is included in fixtures or assertions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  updatePetUseCase,
  ApiValidationError,
  ApiNotFoundError,
} from './update-pet.use-case';
import { ApiError } from '@/lib/api-errors';
import type { UpdatePetPayload } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLIENT_ID = 'client-uuid-1';
const PET_ID = 'pet-uuid-1';
const TOKEN = 'test-bearer-token';

const validPayload: UpdatePetPayload = {
  name: 'Rex',
  weight: 30.5,
  castrated: true,
};

const successResponse = {
  id: PET_ID,
  clientId: CLIENT_ID,
  name: 'Rex',
  species: 'canino',
  breed: 'Labrador',
  birthDate: '2021-01-01T00:00:00.000Z',
  sex: 'male',
  weight: 30.5,
  castrated: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

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
// Happy path
// ---------------------------------------------------------------------------

describe('updatePetUseCase — success', () => {
  it('should call PATCH /v1/clients/:clientId/pets/:petId with Authorization header', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 200));

    await updatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID, payload: validPayload, token: TOKEN });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain(`/v1/clients/${CLIENT_ID}/pets/${PET_ID}`);
    expect((init as RequestInit).method).toBe('PATCH');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    });
  });

  it('should send the payload as JSON in the request body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 200));

    await updatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID, payload: validPayload, token: TOKEN });

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toMatchObject({ name: 'Rex', weight: 30.5, castrated: true });
  });

  it('should return PetDetail when API responds with 200', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 200));

    const result = await updatePetUseCase({
      clientId: CLIENT_ID,
      petId: PET_ID,
      payload: validPayload,
      token: TOKEN,
    });

    expect(result.id).toBe(PET_ID);
    expect(result.clientId).toBe(CLIENT_ID);
    expect(result.weight).toBe(30.5);
  });
});

// ---------------------------------------------------------------------------
// 400 — validation error
// ---------------------------------------------------------------------------

describe('updatePetUseCase — 400 validation error', () => {
  it('should throw ApiValidationError when backend returns 400 with fieldErrors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'VALIDATION_ERROR', fieldErrors: { weight: 'Peso inválido' } },
        400,
      ),
    );

    await expect(
      updatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID, payload: validPayload, token: TOKEN }),
    ).rejects.toBeInstanceOf(ApiValidationError);
  });

  it('should expose fieldErrors from the backend on ApiValidationError', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        {
          code: 'VALIDATION_ERROR',
          fieldErrors: { weight: 'Peso deve estar entre 0,1 e 100 kg', birthDate: 'Data inválida' },
        },
        400,
      ),
    );

    try {
      await updatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID, payload: validPayload, token: TOKEN });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiValidationError);
      expect((err as ApiValidationError).fieldErrors.weight).toBe('Peso deve estar entre 0,1 e 100 kg');
      expect((err as ApiValidationError).fieldErrors.birthDate).toBe('Data inválida');
    }
  });

  it('should fall back to _form when 400 has no fieldErrors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'INVALID_INPUT', message: 'Dados inválidos' }, 400),
    );

    try {
      await updatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID, payload: validPayload, token: TOKEN });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiValidationError);
      expect((err as ApiValidationError).fieldErrors._form).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// 404 — not found
// ---------------------------------------------------------------------------

describe('updatePetUseCase — 404 not found', () => {
  it('should throw ApiNotFoundError when backend returns 404', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'NOT_FOUND', message: 'Pet não encontrado' }, 404),
    );

    await expect(
      updatePetUseCase({ clientId: CLIENT_ID, petId: 'ghost-id', payload: validPayload, token: TOKEN }),
    ).rejects.toBeInstanceOf(ApiNotFoundError);
  });

  it('should throw ApiNotFoundError when pet does not belong to the given clientId', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'NOT_FOUND', message: 'Pet não pertence ao cliente' }, 404),
    );

    await expect(
      updatePetUseCase({ clientId: 'other-client', petId: PET_ID, payload: validPayload, token: TOKEN }),
    ).rejects.toBeInstanceOf(ApiNotFoundError);
  });
});

// ---------------------------------------------------------------------------
// Other non-2xx responses
// ---------------------------------------------------------------------------

describe('updatePetUseCase — other non-2xx responses', () => {
  it('should throw ApiError for unexpected non-2xx status', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500),
    );

    await expect(
      updatePetUseCase({ clientId: CLIENT_ID, petId: PET_ID, payload: validPayload, token: TOKEN }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
