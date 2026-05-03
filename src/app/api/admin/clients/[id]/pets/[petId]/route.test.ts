/**
 * Tests for PATCH /api/admin/clients/[id]/pets/[petId] Route Handler.
 *
 * Mocks `next/headers` (cookies) and global fetch to test the handler
 * in isolation without spinning up a Next.js server.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock next/headers before importing the route handler
// ---------------------------------------------------------------------------

const mockGetCookie = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: mockGetCookie,
  })),
}));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();

  class MockNextResponse extends actual.NextResponse {}

  return {
    ...actual,
    NextResponse: MockNextResponse,
  };
});

// ---------------------------------------------------------------------------
// Import after mocks are set up
// ---------------------------------------------------------------------------

import { PATCH, DELETE } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body = '{"weight":30}', method = 'PATCH'): Request {
  return new Request(
    'http://localhost/api/admin/clients/client-uuid-1/pets/pet-uuid-1',
    {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    },
  );
}

function makeCtx(id = 'client-uuid-1', petId = 'pet-uuid-1') {
  return { params: Promise.resolve({ id, petId }) };
}

function makeBackendResponse(
  body: string,
  status = 200,
  contentType = 'application/json',
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
    headers: {
      get: (name: string) => (name === 'content-type' ? contentType : null),
    },
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
  mockGetCookie.mockReset();
});

// ---------------------------------------------------------------------------
// 401 — missing session cookie
// ---------------------------------------------------------------------------

describe('PATCH /api/admin/clients/[id]/pets/[petId] — 401 when cookie absent', () => {
  it('should return 401 when the session cookie is not set', async () => {
    mockGetCookie.mockReturnValue(undefined);

    const res = await PATCH(makeRequest(), makeCtx());

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe('UNAUTHENTICATED');
  });
});

// ---------------------------------------------------------------------------
// Happy path — 200
// ---------------------------------------------------------------------------

describe('PATCH /api/admin/clients/[id]/pets/[petId] — 200 proxies response', () => {
  it('should forward Authorization header with bearer token to backend', async () => {
    mockGetCookie.mockReturnValue({ value: 'session-token-abc' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse('{"id":"pet-uuid-1","clientId":"client-uuid-1"}', 200),
    );

    await PATCH(makeRequest(), makeCtx());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer session-token-abc',
    });
  });

  it('should call the backend PATCH endpoint with the correct URL including clientId and petId', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse('{"id":"pet-uuid-1"}', 200),
    );

    await PATCH(makeRequest(), makeCtx('client-uuid-1', 'pet-uuid-1'));

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/clients/client-uuid-1/pets/pet-uuid-1');
  });

  it('should echo the backend 200 status', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse('{"id":"pet-uuid-1"}', 200),
    );

    const res = await PATCH(makeRequest(), makeCtx());

    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// 400 — validation error passthrough
// ---------------------------------------------------------------------------

describe('PATCH /api/admin/clients/[id]/pets/[petId] — 400 passthrough', () => {
  it('should echo backend 400 status to the caller', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse(
        '{"code":"VALIDATION_ERROR","fieldErrors":{"weight":"Peso inválido"}}',
        400,
      ),
    );

    const res = await PATCH(makeRequest(), makeCtx());

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// 404 — not found passthrough
// ---------------------------------------------------------------------------

describe('PATCH /api/admin/clients/[id]/pets/[petId] — 404 passthrough', () => {
  it('should echo backend 404 status when pet does not belong to client', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse('{"code":"NOT_FOUND","message":"Pet não encontrado"}', 404),
    );

    const res = await PATCH(makeRequest(), makeCtx());

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// 5xx — opaque passthrough (no internal details leaked)
// ---------------------------------------------------------------------------

describe('PATCH /api/admin/clients/[id]/pets/[petId] — 5xx opaque passthrough', () => {
  it('should forward the raw backend 500 body without modification', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    const backendBody = '{"code":"INTERNAL_ERROR","message":"Internal server error"}';
    mockFetch.mockResolvedValueOnce(makeBackendResponse(backendBody, 500));

    const res = await PATCH(makeRequest(), makeCtx());

    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toBe(backendBody);
  });
});

// ===========================================================================
// DELETE /api/admin/clients/[id]/pets/[petId]
// ===========================================================================

function makeDeleteRequest(): Request {
  return new Request(
    'http://localhost/api/admin/clients/client-uuid-1/pets/pet-uuid-1',
    { method: 'DELETE' },
  );
}

// ---------------------------------------------------------------------------
// 401 — missing session cookie
// ---------------------------------------------------------------------------

describe('DELETE /api/admin/clients/[id]/pets/[petId] — 401 when cookie absent', () => {
  it('should return 401 when the session cookie is not set', async () => {
    mockGetCookie.mockReturnValue(undefined);

    const res = await DELETE(makeDeleteRequest(), makeCtx());

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe('UNAUTHENTICATED');
  });
});

// ---------------------------------------------------------------------------
// Authorization header forwarding
// ---------------------------------------------------------------------------

describe('DELETE /api/admin/clients/[id]/pets/[petId] — Authorization header forwarded', () => {
  it('should forward Authorization: Bearer <token> to the backend', async () => {
    mockGetCookie.mockReturnValue({ value: 'session-token-abc' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse('', 204));

    await DELETE(makeDeleteRequest(), makeCtx());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer session-token-abc',
    });
  });

  it('should call the backend DELETE endpoint with the correct URL including clientId and petId', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse('', 204));

    await DELETE(makeDeleteRequest(), makeCtx('client-uuid-1', 'pet-uuid-1'));

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/clients/client-uuid-1/pets/pet-uuid-1');
  });
});

// ---------------------------------------------------------------------------
// Status passthrough — 204, 404, 409
// ---------------------------------------------------------------------------

describe('DELETE /api/admin/clients/[id]/pets/[petId] — status passthrough', () => {
  it('should echo the backend 204 status on successful deactivation', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse('', 204));

    const res = await DELETE(makeDeleteRequest(), makeCtx());

    expect(res.status).toBe(204);
  });

  it('should echo backend 404 when pet is not found', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse('{"code":"NOT_FOUND","message":"Pet não encontrado"}', 404),
    );

    const res = await DELETE(makeDeleteRequest(), makeCtx());

    expect(res.status).toBe(404);
  });

  it('should echo backend 409 with PET_HAS_PLANS body', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    const backendBody = '{"code":"PET_HAS_PLANS","message":"Pet possui planos associados."}';
    mockFetch.mockResolvedValueOnce(makeBackendResponse(backendBody, 409));

    const res = await DELETE(makeDeleteRequest(), makeCtx());

    expect(res.status).toBe(409);
    const text = await res.text();
    expect(text).toBe(backendBody);
  });
});
