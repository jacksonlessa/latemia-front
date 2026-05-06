import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * POST /api/admin/benefit-usages
 *
 * Internal Route Handler that proxies the request to
 * `POST /v1/benefit-usages` on the backend, attaching the JWT bearer token
 * read from the `latemia_session` httpOnly cookie.
 *
 * The body is forwarded as-is. The backend's `{ code, message }` error shape
 * is preserved in the response so callers can map it to `ApiError`.
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHENTICATED", message: "Sessão expirada." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_BODY", message: "Corpo inválido." },
      { status: 400 },
    );
  }

  const backendRes = await fetch(`${API_URL}/v1/benefit-usages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await backendRes.text();
  return new NextResponse(text, {
    status: backendRes.status,
    headers: {
      "Content-Type":
        backendRes.headers.get("content-type") ?? "application/json",
    },
  });
}
