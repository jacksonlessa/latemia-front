import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/clients/:id/payment-update-token
 *
 * Internal Route Handler that proxies the request to
 * `POST /v1/clients/:id/payment-update-token` on the backend, attaching the
 * JWT bearer token read from the `latemia_session` httpOnly cookie.
 *
 * Used by `generateClientPaymentUpdateTokenUseCase` (Client Component context)
 * which cannot read the httpOnly cookie directly.
 *
 * Replaces the plan-scoped route handler (`/api/admin/plans/:id/payment-update-token`)
 * after the pivot to a single subscription per client.
 * The generated link updates the card for ALL pets in the client's subscription.
 *
 * - Returns 401 when the session cookie is absent.
 * - Echoes the backend status code and response body verbatim.
 */
export async function POST(_req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', message: 'Sessão expirada.' },
      { status: 401 },
    );
  }

  const backendRes = await fetch(
    `${API_URL}/v1/clients/${encodeURIComponent(id)}/payment-update-token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
