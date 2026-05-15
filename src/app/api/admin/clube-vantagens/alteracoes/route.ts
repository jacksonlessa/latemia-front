import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Internal Route Handler that proxies admin requests for the Clube de
 * Vantagens alteracoes resource:
 *
 *  - `POST /api/admin/clube-vantagens/alteracoes`
 *      → proxies to `POST /v1/admin/clube-vantagens/alteracoes` on backend.
 *      Forwards `Idempotency-Key` header (required by backend interceptor).
 *
 *  - `GET /api/admin/clube-vantagens/alteracoes`
 *      → proxies to `GET /v1/admin/clube-vantagens/alteracoes` on backend.
 *
 * Both attach the JWT bearer token read from the `latemia_session` httpOnly
 * cookie. The httpOnly cookie cannot be read by Client Components, so this
 * proxy is the only way client-side use-cases can authenticate.
 *
 * Behavior:
 *  - 401 when the session cookie is absent.
 *  - Echo the backend status code and JSON body verbatim so the client
 *    use-cases can map HTTP status codes to typed errors.
 *
 * LGPD: no body fields are logged here — only HTTP status codes. The
 * `resumoAlteracoes` text passes through opaquely.
 */

export async function POST(req: Request): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', message: 'Sessão expirada.' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const idempotencyKey = req.headers.get('idempotency-key');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const backendRes = await fetch(
    `${API_URL}/v1/admin/clube-vantagens/alteracoes`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    },
  );

  const responseText = await backendRes.text();
  return new NextResponse(responseText, {
    status: backendRes.status,
    headers: {
      'Content-Type':
        backendRes.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', message: 'Sessão expirada.' },
      { status: 401 },
    );
  }

  const backendRes = await fetch(
    `${API_URL}/v1/admin/clube-vantagens/alteracoes`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  const responseText = await backendRes.text();
  return new NextResponse(responseText, {
    status: backendRes.status,
    headers: {
      'Content-Type':
        backendRes.headers.get('content-type') ?? 'application/json',
    },
  });
}
