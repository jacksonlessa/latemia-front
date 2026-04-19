/**
 * listPlansUseCase
 *
 * Server-side use case that fetches a paginated list of plans from
 * GET /v1/plans, forwarding the admin JWT token.
 *
 * Intended to be called from Server Components only.
 * Note: server-only is not imported so this module remains testable via Vitest.
 * The calling Server Component is responsible for enforcing server-side execution.
 */

import type { PlanListResponse } from '@/lib/types/plan';
import type { PlanStatus } from '@/lib/types/plan';

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export interface ListPlansParams {
  page?: number;
  perPage?: number;
  status?: PlanStatus;
  search?: string;
  clientId?: string;
  token: string;
}

export async function listPlansUseCase(
  params: ListPlansParams,
): Promise<PlanListResponse> {
  const qs = new URLSearchParams();

  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.perPage !== undefined) qs.set('perPage', String(params.perPage));
  if (params.status !== undefined)
    qs.set('status', params.status);
  if (params.search !== undefined && params.search !== '')
    qs.set('search', params.search);
  if (params.clientId !== undefined && params.clientId !== '')
    qs.set('clientId', params.clientId);

  const query = qs.toString();
  const url = `${apiUrl()}/v1/plans${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${params.token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch plans: HTTP ${res.status}`);
  }

  return res.json() as Promise<PlanListResponse>;
}
