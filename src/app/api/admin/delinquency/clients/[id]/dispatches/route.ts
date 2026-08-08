import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/delinquency/clients/:id/dispatches
 *
 * Internal Route Handler that proxies the request to
 * `POST /v1/admin/delinquency/clients/:clientId/dispatches` on the backend,
 * attaching the JWT bearer token read from the `latemia_session` httpOnly
 * cookie. Used by `recordDelinquencyDispatchUseCase` (Client Component
 * context) which cannot read the httpOnly cookie directly.
 *
 * - Returns 401 when the session cookie is absent.
 * - Echoes the backend status code and response body verbatim (201 on
 *   success, 422 `STAGE_NOT_APPLICABLE` when the stage is no longer
 *   pending for the client).
 */
export async function POST(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Sessão expirada." },
      { status: 401 },
    );
  }

  const body = await req.text();

  const backendRes = await fetch(
    `${API_URL}/v1/admin/delinquency/clients/${encodeURIComponent(id)}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    },
  );

  const responseText = await backendRes.text();
  return new NextResponse(responseText, {
    status: backendRes.status,
    headers: {
      "Content-Type":
        backendRes.headers.get("content-type") ?? "application/json",
    },
  });
}
