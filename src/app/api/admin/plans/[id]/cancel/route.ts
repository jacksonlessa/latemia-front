import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/plans/:id/cancel
 *
 * Internal Route Handler that proxies the request to
 * `POST /v1/plans/:id/cancel` on the backend, attaching the JWT bearer token
 * read from the `latemia_session` httpOnly cookie.
 *
 * Used by `cancelPlanUseCase` (Client Component context) which cannot read the
 * httpOnly cookie directly.
 *
 * - Returns 401 when the session cookie is absent.
 * - Echoes the backend status code and response body verbatim so the use case
 *   can map HTTP error codes to typed errors.
 *
 * LGPD: reason text is not logged here — only planId and HTTP status.
 */
export async function POST(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;

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

  const backendRes = await fetch(
    `${API_URL}/v1/plans/${encodeURIComponent(id)}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
