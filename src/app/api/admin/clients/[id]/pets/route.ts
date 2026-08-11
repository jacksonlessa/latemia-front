import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/clients/:id/pets
 *
 * Internal Route Handler that proxies the request to
 * `POST /v1/clients/:clientId/pets` on the backend (Tarefa 3.0 —
 * `adicao-pet-cliente-existente`), attaching the JWT bearer token read from
 * the `latemia_session` httpOnly cookie. Used by `AddPetToClientDialog`
 * (Client Component) which cannot read the httpOnly cookie.
 *
 * - Returns 401 when the session cookie is absent.
 * - Forwards the `Idempotency-Key` header received from the client — the
 *   dialog generates it once per dialog opening (`crypto.randomUUID()`) so
 *   retries after a failed submit reuse the same key.
 * - Echoes the backend status code and response body verbatim (`422` with
 *   `reason`, `409` name collision, `502` upstream provider failure, etc.).
 * - In case of backend 5xx, the body is forwarded opaquely (no internal
 *   details are added or removed).
 *
 * LGPD: the request body contains pet data (name, birthDate, weight, etc.);
 * it is forwarded directly to the backend and is never logged here.
 */
export async function POST(req: Request, ctx: RouteContext) {
  const { id: clientId } = await ctx.params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', message: 'Sessão expirada.' },
      { status: 401 },
    );
  }

  const idempotencyKey = req.headers.get('idempotency-key');
  const body = await req.text();

  const backendRes = await fetch(
    `${API_URL}/v1/clients/${encodeURIComponent(clientId)}/pets`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
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
