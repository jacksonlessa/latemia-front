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
 * Returns `{ tutorMaskedName, petsCovered, chargesBehavior }` on 200, where
 *   `tutorMaskedName` — tutor name with LGPD masking applied by the backend.
 *   `petsCovered`     — array of pet names covered by the client's subscription.
 *   `chargesBehavior` ∈ { immediate | next_cycle } — aggregated across all plans:
 *     `immediate`  if at least one plan is `pendente`/`inadimplente`;
 *     `next_cycle` if all plans are `ativo`/`carencia`.
 * Returns 404 for invalid/expired/used tokens (generic — no enumeration).
 *
 * LGPD: response contains only masked tutor name and pet names — no CPF, phone, or email.
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
 * Proxies to `POST /v1/payment-update/:token` on the backend transparently
 * (raw body is forwarded; no transformation).
 *
 * Expected body: `{ cardToken: string }` — PAN/CVV never reach this handler.
 *
 * Returns `{ outcome, chargesBehavior, failureMessage? }` on 200, where
 *   `outcome` ∈ { card_updated_no_charge | charge_paid | charge_pending | charge_failed }.
 * `charge_failed` is still a 200 — the token stays alive on the backend so
 * the client can try another card without a new link. The page renders the
 * `failureMessage` inline.
 *
 * Returns 404 for invalid/expired/used tokens.
 * Returns 400 for validation/gateway errors prior to the retry.
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
