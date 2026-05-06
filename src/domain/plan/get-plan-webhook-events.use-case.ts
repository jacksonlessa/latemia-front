/**
 * getPlanWebhookEventsUseCase
 *
 * Server-side use case that fetches the webhook events received from the
 * payment provider for a given plan, via GET /v1/plans/:id/webhook-events.
 *
 * Endpoint admin-only no backend (RolesGuard) — chamadas com token de
 * atendente retornam 403.
 */

import { ApiError } from '@/lib/api-errors';
import type { PlanWebhookEvent } from '@/lib/types/plan';

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export async function getPlanWebhookEventsUseCase(
  id: string,
  token: string,
): Promise<PlanWebhookEvent[]> {
  const res = await fetch(
    `${apiUrl()}/v1/plans/${encodeURIComponent(id)}/webhook-events`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

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

  return res.json() as Promise<PlanWebhookEvent[]>;
}
