import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * GET /api/admin/delinquency/clients
 *
 * Internal Route Handler that proxies the request to
 * `GET /v1/admin/delinquency/clients` on the backend, attaching the JWT
 * bearer token read from the `latemia_session` httpOnly cookie. Used by the
 * `DelinquentClientsList` (Client Component) which cannot read the httpOnly
 * cookie directly.
 *
 * Query params:
 * - `sort` — forwarded as-is (`daysOverdue:asc` | `daysOverdue:desc`).
 *
 * - Returns 401 when the session cookie is absent.
 * - Echoes the backend status code and response body verbatim.
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Sessão expirada." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort");

  const upstream = new URLSearchParams();
  if (sort) upstream.set("sort", sort);
  const query = upstream.toString();

  const backendRes = await fetch(
    `${API_URL}/v1/admin/delinquency/clients${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
