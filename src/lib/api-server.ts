/**
 * Chamadas HTTP ao backend — exclusivamente lado servidor.
 * Não importar em Client Components.
 */

import type { SessionUser } from "./session";

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}

/** Busca o perfil do usuário autenticado via GET /v1/auth/me. */
export async function fetchMe(token: string): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${apiUrl()}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as SessionUser;
  } catch {
    return null;
  }
}
