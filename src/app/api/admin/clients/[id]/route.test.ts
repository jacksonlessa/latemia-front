/**
 * Tests for PATCH /api/admin/clients/[id] Route Handler.
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

import { PATCH } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body = '{"name":"Test"}', method = 'PATCH'): Request {
  return new Request('http://localhost/api/admin/clients/client-uuid-1', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

function makeCtx(id = 'client-uuid-1') {
  return { params: Promise.resolve({ id }) };
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

describe('PATCH /api/admin/clients/[id] — 401 when cookie absent', () => {
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

describe('PATCH /api/admin/clients/[id] — 200 proxies response', () => {
  it('should forward Authorization header with bearer token to backend', async () => {
    mockGetCookie.mockReturnValue({ value: 'session-token-abc' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse('{"id":"client-uuid-1"}', 200),
    );

    await PATCH(makeRequest(), makeCtx());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer session-token-abc',
    });
  });

  it('should call the backend PATCH endpoint with the correct URL', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse('{"id":"client-uuid-1"}', 200),
    );

    await PATCH(makeRequest(), makeCtx('client-uuid-1'));

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/clients/client-uuid-1');
  });

  it('should echo the backend 200 status', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse('{"id":"client-uuid-1"}', 200),
    );

    const res = await PATCH(makeRequest(), makeCtx());

    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// 400 — validation error passthrough
// ---------------------------------------------------------------------------

describe('PATCH /api/admin/clients/[id] — 400 passthrough', () => {
  it('should echo backend 400 status to the caller', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse(
        '{"code":"VALIDATION_ERROR","fieldErrors":{"email":"E-mail inválido"}}',
        400,
      ),
    );

    const res = await PATCH(makeRequest(), makeCtx());

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// 5xx — opaque passthrough (no internal details leaked)
// ---------------------------------------------------------------------------

describe('PATCH /api/admin/clients/[id] — 5xx opaque passthrough', () => {
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
