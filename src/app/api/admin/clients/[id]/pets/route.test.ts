/**
 * Tests for POST /api/admin/clients/[id]/pets Route Handler.
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

import { POST } from './route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(
  body = '{"name":"Rex","tutorAcknowledged":true}',
  idempotencyKey: string | null = 'idem-key-1',
): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return new Request('http://localhost/api/admin/clients/client-uuid-1/pets', {
    method: 'POST',
    headers,
    body,
  });
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

describe('POST /api/admin/clients/[id]/pets — 401 when cookie absent', () => {
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

describe('POST /api/admin/clients/[id]/pets — 201 proxies response', () => {
  it('should forward Authorization header with bearer token to backend', async () => {
    mockGetCookie.mockReturnValue({ value: 'session-token-abc' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeBackendResponse(
        '{"petId":"pet-1","planId":"plan-1","nextBillingAt":"2026-08-01T00:00:00.000Z","nextBillingAmountCents":7500,"coverageStartsAt":"2026-08-01T00:00:00.000Z"}',
        201,
      ),
    );

    await POST(makeRequest(), makeCtx());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer session-token-abc',
    });
  });

  it('should call the backend POST endpoint with the correct URL including clientId', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse('{"petId":"pet-1"}', 201));

    await POST(makeRequest(), makeCtx('client-uuid-1'));

    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain('/v1/clients/client-uuid-1/pets');
  });

  it('should forward the Idempotency-Key header received from the client', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse('{"petId":"pet-1"}', 201));

    await POST(makeRequest(undefined, 'idem-key-42'), makeCtx());

    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      'Idempotency-Key': 'idem-key-42',
    });
  });

  it('should not include an Idempotency-Key header when absent from the request', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeBackendResponse('{"petId":"pet-1"}', 201));

    await POST(makeRequest(undefined, null), makeCtx());

    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).headers).not.toHaveProperty('Idempotency-Key');
  });

  it('should echo the backend 201 status and body', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    const backendBody =
      '{"petId":"pet-1","planId":"plan-1","nextBillingAt":"2026-08-01T00:00:00.000Z","nextBillingAmountCents":7500,"coverageStartsAt":"2026-08-01T00:00:00.000Z"}';
    mockFetch.mockResolvedValueOnce(makeBackendResponse(backendBody, 201));

    const res = await POST(makeRequest(), makeCtx());

    expect(res.status).toBe(201);
    const text = await res.text();
    expect(text).toBe(backendBody);
  });
});

// ---------------------------------------------------------------------------
// Error passthrough — 422, 409, 502
// ---------------------------------------------------------------------------

describe('POST /api/admin/clients/[id]/pets — error passthrough', () => {
  it('should echo backend 422 with reason for a blocked client', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    const backendBody =
      '{"code":"CLIENT_NOT_ELIGIBLE_FOR_PET_ADDITION","reason":"client_inadimplente"}';
    mockFetch.mockResolvedValueOnce(makeBackendResponse(backendBody, 422));

    const res = await POST(makeRequest(), makeCtx());

    expect(res.status).toBe(422);
    const text = await res.text();
    expect(text).toBe(backendBody);
  });

  it('should echo backend 409 for a pet name collision', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    const backendBody =
      '{"code":"INVALID_INPUT","message":"Já existe um pet com esse nome para este cliente."}';
    mockFetch.mockResolvedValueOnce(makeBackendResponse(backendBody, 409));

    const res = await POST(makeRequest(), makeCtx());

    expect(res.status).toBe(409);
    const text = await res.text();
    expect(text).toBe(backendBody);
  });

  it('should echo backend 502 for a provider upstream failure', async () => {
    mockGetCookie.mockReturnValue({ value: 'token-xyz' });
    const mockFetch = vi.mocked(fetch);
    const backendBody = '{"code":"PROVIDER_UPSTREAM","message":"Pagar.me indisponível."}';
    mockFetch.mockResolvedValueOnce(makeBackendResponse(backendBody, 502));

    const res = await POST(makeRequest(), makeCtx());

    expect(res.status).toBe(502);
    const text = await res.text();
    expect(text).toBe(backendBody);
  });
});
