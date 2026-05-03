import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/clients/:id
 *
 * Internal Route Handler that proxies the request to
 * `PATCH /v1/clients/:id` on the backend, attaching the JWT bearer token
 * read from the `latemia_session` httpOnly cookie. Used by the
 * EditClientDrawer (Client Component) which cannot read the httpOnly cookie.
 *
 * - Returns 401 when the session cookie is absent.
 * - Echoes the backend status code and response body verbatim.
 * - In case of backend 5xx, the body is forwarded opaquely (no internal
 *   details are added or removed).
 *
 * LGPD: the request body may contain PII (name, email, phone, address).
 * It is forwarded directly to the backend and is never logged here.
 */
export async function PATCH(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', message: 'Sessão expirada.' },
      { status: 401 },
    );
  }

  const body = await req.text();

  const backendRes = await fetch(
    `${API_URL}/v1/clients/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
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
