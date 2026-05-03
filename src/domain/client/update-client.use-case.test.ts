/**
 * Unit tests for updateClientUseCase.
 *
 * Mocks global fetch to test the use-case in isolation.
 * No personal data is included in fixtures or assertions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  updateClientUseCase,
  ApiValidationError,
  ApiNotFoundError,
  ApiConflictError,
} from './update-client.use-case';
import { ApiError } from '@/lib/api-errors';
import type { UpdateClientPayload } from '@/lib/types/client';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLIENT_ID = 'client-uuid-1';
const TOKEN = 'test-bearer-token';

const validPayload: UpdateClientPayload = {
  name: 'Maria da Silva',
  phone: '11987654321',
  email: 'maria@example.com',
};

const successResponse = {
  id: CLIENT_ID,
  name: 'Maria da Silva',
  cpf: '529.982.247-25',
  phone: '11987654321',
  email: 'maria@example.com',
  addresses: [],
  pets: [],
  createdAt: '2026-01-01T00:00:00.000Z',
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

describe('updateClientUseCase — success', () => {
  it('should call PATCH /v1/clients/:id with Authorization header', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 200));

    await updateClientUseCase({ id: CLIENT_ID, payload: validPayload, token: TOKEN });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain(`/v1/clients/${CLIENT_ID}`);
    expect((init as RequestInit).method).toBe('PATCH');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    });
  });

  it('should send the payload as JSON in the request body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 200));

    await updateClientUseCase({ id: CLIENT_ID, payload: validPayload, token: TOKEN });

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toMatchObject({ name: 'Maria da Silva', phone: '11987654321' });
  });

  it('should return ClientDetail when API responds with 200', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 200));

    const result = await updateClientUseCase({
      id: CLIENT_ID,
      payload: validPayload,
      token: TOKEN,
    });

    expect(result.id).toBe(CLIENT_ID);
    expect(result.name).toBe('Maria da Silva');
  });
});

// ---------------------------------------------------------------------------
// 400 — validation error
// ---------------------------------------------------------------------------

describe('updateClientUseCase — 400 validation error', () => {
  it('should throw ApiValidationError when backend returns 400 with fieldErrors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'VALIDATION_ERROR', fieldErrors: { email: 'E-mail inválido' } },
        400,
      ),
    );

    await expect(
      updateClientUseCase({ id: CLIENT_ID, payload: validPayload, token: TOKEN }),
    ).rejects.toBeInstanceOf(ApiValidationError);
  });

  it('should expose fieldErrors from the backend on ApiValidationError', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        {
          code: 'VALIDATION_ERROR',
          fieldErrors: { email: 'E-mail inválido', phone: 'Telefone inválido' },
        },
        400,
      ),
    );

    try {
      await updateClientUseCase({ id: CLIENT_ID, payload: validPayload, token: TOKEN });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiValidationError);
      expect((err as ApiValidationError).fieldErrors.email).toBe('E-mail inválido');
      expect((err as ApiValidationError).fieldErrors.phone).toBe('Telefone inválido');
    }
  });

  it('should fall back to _form when 400 has no fieldErrors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'INVALID_INPUT', message: 'Dados inválidos' }, 400),
    );

    try {
      await updateClientUseCase({ id: CLIENT_ID, payload: validPayload, token: TOKEN });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiValidationError);
      expect((err as ApiValidationError).fieldErrors._form).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// 404 — not found
// ---------------------------------------------------------------------------

describe('updateClientUseCase — 404 not found', () => {
  it('should throw ApiNotFoundError when backend returns 404', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'NOT_FOUND', message: 'Cliente não encontrado' }, 404),
    );

    await expect(
      updateClientUseCase({ id: 'ghost-id', payload: validPayload, token: TOKEN }),
    ).rejects.toBeInstanceOf(ApiNotFoundError);
  });

  it('should expose status 404 on ApiNotFoundError', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'NOT_FOUND' }, 404),
    );

    try {
      await updateClientUseCase({ id: 'ghost-id', payload: validPayload, token: TOKEN });
    } catch (err) {
      expect((err as ApiNotFoundError).status).toBe(404);
    }
  });
});

// ---------------------------------------------------------------------------
// 409 — email conflict
// ---------------------------------------------------------------------------

describe('updateClientUseCase — 409 CLIENT_EMAIL_TAKEN', () => {
  it('should throw ApiConflictError with code CLIENT_EMAIL_TAKEN when backend returns 409', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'CLIENT_EMAIL_TAKEN', message: 'E-mail já está em uso por outro cliente.' },
        409,
      ),
    );

    await expect(
      updateClientUseCase({ id: CLIENT_ID, payload: validPayload, token: TOKEN }),
    ).rejects.toBeInstanceOf(ApiConflictError);
  });

  it('should expose code CLIENT_EMAIL_TAKEN on the thrown error', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'CLIENT_EMAIL_TAKEN', message: 'E-mail já está em uso por outro cliente.' },
        409,
      ),
    );

    try {
      await updateClientUseCase({ id: CLIENT_ID, payload: validPayload, token: TOKEN });
    } catch (err) {
      expect((err as ApiConflictError).code).toBe('CLIENT_EMAIL_TAKEN');
      expect((err as ApiConflictError).status).toBe(409);
    }
  });
});

// ---------------------------------------------------------------------------
// Other non-2xx responses
// ---------------------------------------------------------------------------

describe('updateClientUseCase — other non-2xx responses', () => {
  it('should throw ApiError for unexpected non-2xx status', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500),
    );

    await expect(
      updateClientUseCase({ id: CLIENT_ID, payload: validPayload, token: TOKEN }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
