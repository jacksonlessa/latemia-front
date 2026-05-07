/**
 * Tests for POST /api/admin/clients/[id]/payment-update-token Route Handler.
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

// Mock NextResponse so we can inspect the constructor arguments
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

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(method = 'POST'): Request {
  return new Request(
    'http://localhost/api/admin/clients/client-uuid-1/payment-update-token',
    { method },
  );
}

function makeCtx(id = 'client-uuid-1') {
  return { params: Promise.resolve({ id }) };
}

function makeBackendResponse(
  body: string,
  status = 201,
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

describe('POST /api/admin/clients/[id]/payment-update-token — 401 when cookie absent', () => {
  it('should return 401 when the session cookie is not set', async () => {
    mockGetCookie.mockReturnValue(undefined);

    const res = await POST(makeRequest(), makeCtx());

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe('UNAUTHENTICATED');
  });
});

// ---------------------------------------------------------------------------
// Happy path — 201
// ---------------------------------------------------------------------------

describe('POST /api/admin/clients/[id]/payment-update-token — 201 proxies response', () => {
  const mockResponseBody = JSON.stringify({
    token: 'uuid-client-token-0001',
    url: 'https://latemia.com.br/atualizar-pagamento?token=uuid-client-token-0001',
    expiresAt: '2026-05-14T12:00:00.000Z',
    status: 'active',
  });

  it('should forward Authorization header with bearer token to backend', async () => {
    mockGetCookie.mockReturnValue({ value: 'session-token-abc' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse(mockResponseBody, 201));

    await POST(makeRequest(), makeCtx());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer session-token-abc',
    });
  });

  it('should call the backend POST endpoint with the correct URL', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse(mockResponseBody, 201));

    await POST(makeRequest(), makeCtx('client-uuid-1'));

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/clients/client-uuid-1/payment-update-token');
  });

  it('should echo the backend 201 status', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse(mockResponseBody, 201));

    const res = await POST(makeRequest(), makeCtx());

    expect(res.status).toBe(201);
  });

  it('should return the token body verbatim', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse(mockResponseBody, 201));

    const res = await POST(makeRequest(), makeCtx());
    const text = await res.text();

    expect(text).toBe(mockResponseBody);
  });
});

// ---------------------------------------------------------------------------
// 422 — client ineligible passthrough
// ---------------------------------------------------------------------------

describe('POST /api/admin/clients/[id]/payment-update-token — 422 passthrough', () => {
  it('should echo backend 422 status to the caller', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse(
        '{"code":"CLIENT_NOT_ELIGIBLE_FOR_PAYMENT_UPDATE","message":"Nenhum plano elegível."}',
        422,
      ),
    );

    const res = await POST(makeRequest(), makeCtx());

    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// 5xx — opaque passthrough
// ---------------------------------------------------------------------------

describe('POST /api/admin/clients/[id]/payment-update-token — 5xx opaque passthrough', () => {
  it('should forward the raw backend 500 body without modification', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    const backendBody = '{"code":"INTERNAL_ERROR","message":"Internal server error"}';
    mockFetch.mockResolvedValueOnce(makeBackendResponse(backendBody, 500));

    const res = await POST(makeRequest(), makeCtx());

    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toBe(backendBody);
  });
});
