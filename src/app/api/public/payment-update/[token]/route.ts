import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface RouteContext {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/public/payment-update/:token
 *
 * Public Route Handler — no auth required.
 * Proxies to `GET /v1/payment-update/:token` on the backend.
 *
 * Returns { petName, planStatus, chargesBehavior } on 200.
 * Returns 404 for invalid/expired/used tokens (generic — no enumeration).
 *
 * LGPD: response contains only petName and planStatus — no PII.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  const { token } = await ctx.params;

  const backendRes = await fetch(
    `${API_URL}/v1/payment-update/${encodeURIComponent(token)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    },
  );

  const text = await backendRes.text();
  return new NextResponse(text, {
    status: backendRes.status,
    headers: {
      'Content-Type':
        backendRes.headers.get('content-type') ?? 'application/json',
    },
  });
}

/**
 * POST /api/public/payment-update/:token
 *
 * Public Route Handler — no auth required.
 * Proxies to `POST /v1/payment-update/:token` on the backend.
 *
 * Expected body: `{ cardToken: string }` — PAN/CVV never reach this handler.
 *
 * Returns { chargesBehavior } on 200.
 * Returns 404 for invalid/expired/used tokens.
 * Returns 400 for gateway errors (card declined, etc.).
 */
export async function POST(req: Request, ctx: RouteContext) {
  const { token } = await ctx.params;

  const body = await req.text();

  const backendRes = await fetch(
    `${API_URL}/v1/payment-update/${encodeURIComponent(token)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    },
  );

  const text = await backendRes.text();
  return new NextResponse(text, {
    status: backendRes.status,
    headers: {
      'Content-Type':
        backendRes.headers.get('content-type') ?? 'application/json',
    },
  });
}
