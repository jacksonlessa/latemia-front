import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface RouteContext {
  params: Promise<{ stageDays: string }>;
}

/**
 * PUT /api/admin/delinquency/templates/:stageDays
 *
 * Internal Route Handler that proxies the request to
 * `PUT /v1/admin/delinquency/templates/:stageDays` on the backend, attaching
 * the JWT bearer token read from the `latemia_session` httpOnly cookie. Used
 * by `updateDelinquencyTemplateUseCase` (Client Component context) which
 * cannot read the httpOnly cookie directly.
 *
 * - Returns 401 when the session cookie is absent.
 * - Echoes the backend status code and response body verbatim (404 unknown
 *   stage, 422 `TEMPLATE_MISSING_LINK_PLACEHOLDER`, etc.).
 */
export async function PUT(req: Request, ctx: RouteContext) {
  const { stageDays } = await ctx.params;

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
    `${API_URL}/v1/admin/delinquency/templates/${encodeURIComponent(stageDays)}`,
    {
      method: 'PUT',
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
