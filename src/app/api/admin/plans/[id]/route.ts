import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/plans/:id
 *
 * Internal Route Handler that proxies the request to
 * `GET /v1/plans/:id` on the backend, attaching the JWT bearer token read
 * from the `latemia_session` httpOnly cookie. Used by the dashboard's
 * `PlanDetailDrawer` (Client Component) which cannot read the httpOnly
 * cookie directly.
 *
 * The backend's `{ code, message }` error shape is preserved so callers can
 * surface the message to the operator.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Sessão expirada." },
      { status: 401 },
    );
  }

  const backendRes = await fetch(
    `${API_URL}/v1/plans/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  const text = await backendRes.text();
  return new NextResponse(text, {
    status: backendRes.status,
    headers: {
      "Content-Type":
        backendRes.headers.get("content-type") ?? "application/json",
    },
  });
}
