import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * GET /api/admin/delinquency/templates
 *
 * Internal Route Handler that proxies the request to
 * `GET /v1/admin/delinquency/templates` on the backend, attaching the JWT
 * bearer token read from the `latemia_session` httpOnly cookie. Used by the
 * `DelinquencyTemplateEditor` (Client Component) which cannot read the
 * httpOnly cookie directly.
 *
 * - Returns 401 when the session cookie is absent.
 * - Echoes the backend status code and response body verbatim.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', message: 'Sessão expirada.' },
      { status: 401 },
    );
  }

  const backendRes = await fetch(`${API_URL}/v1/admin/delinquency/templates`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const responseText = await backendRes.text();
  return new NextResponse(responseText, {
    status: backendRes.status,
    headers: {
      'Content-Type':
        backendRes.headers.get('content-type') ?? 'application/json',
    },
  });
}
