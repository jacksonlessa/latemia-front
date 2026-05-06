import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const DEFAULT_PER_PAGE = 8;
const MAX_PER_PAGE = 50;
const MIN_PER_PAGE = 1;

/**
 * GET /api/admin/clients/search
 *
 * Internal Route Handler that proxies a quick-search query to the backend
 * `GET /v1/clients` endpoint, attaching the JWT bearer token read from the
 * `latemia_session` httpOnly cookie. Used by the admin Topbar's header
 * search dropdown (Client Component) which cannot read the httpOnly cookie
 * directly.
 *
 * Query params:
 * - `q`        — search term forwarded as `search` to the backend.
 * - `perPage`  — page size, clamped to [1, 50]; defaults to 8.
 *
 * The backend's `{ code, message }` error shape and Content-Type are
 * preserved so callers can surface the response unchanged.
 *
 * LGPD: the search term may contain PII (CPF, phone, email). It is never
 * logged here — only forwarded to the upstream call.
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
  const q = (searchParams.get("q") ?? "").trim();

  const perPageRaw = Number(searchParams.get("perPage"));
  const perPage = Number.isFinite(perPageRaw)
    ? Math.min(MAX_PER_PAGE, Math.max(MIN_PER_PAGE, Math.trunc(perPageRaw)))
    : DEFAULT_PER_PAGE;

  const upstream = new URLSearchParams();
  if (q) upstream.set("search", q);
  upstream.set("perPage", String(perPage));

  const backendRes = await fetch(
    `${API_URL}/v1/clients?${upstream.toString()}`,
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
