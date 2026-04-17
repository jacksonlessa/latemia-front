import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Corpo inválido." }, { status: 400 });
  }

  const { email, password } = body as { email?: string; password?: string };

  const backendRes = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!backendRes.ok) {
    const err = (await backendRes.json()) as { message?: string };
    return NextResponse.json(
      { message: err.message ?? "Credenciais inválidas." },
      { status: backendRes.status },
    );
  }

  const { accessToken, expiresIn } = (await backendRes.json()) as {
    accessToken: string;
    expiresIn: number;
  };

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
