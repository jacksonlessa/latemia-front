/**
 * getPlanByIdUseCase
 *
 * Server-side use case that fetches the full detail of a single plan from
 * GET /v1/plans/:id, forwarding the admin JWT token.
 *
 * Throws an ApiError with status 404 when the plan is not found so that
 * the calling Server Component can call notFound().
 *
 * Intended to be called from Server Components only.
 * Note: server-only is not imported so this module remains testable via Vitest.
 */

import { ApiError } from '@/lib/api-errors';
import type { PlanDetail } from '@/lib/types/plan';

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export async function getPlanByIdUseCase(
  id: string,
  token: string,
): Promise<PlanDetail> {
  const res = await fetch(`${apiUrl()}/v1/plans/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (res.status === 404) {
    throw new ApiError(404, 'PLAN_NOT_FOUND', 'Plano não encontrado.');
  }

  if (!res.ok) {
    let code = 'UNKNOWN_ERROR';
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { code?: string; message?: string };
      if (body.code) code = body.code;
      if (body.message) message = body.message;
    } catch {
      // non-JSON body — keep defaults
    }
    throw new ApiError(res.status, code, message);
  }

  return res.json() as Promise<PlanDetail>;
}
