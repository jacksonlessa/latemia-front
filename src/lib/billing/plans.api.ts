/**
 * Client-side HTTP functions for the billing plans API.
 * All calls hit /v1/admin/billing/plans on the NestJS backend.
 * The backend is the only party that communicates with Pagar.me.
 */

import type { Plan, Paginated, CreatePlanInput } from '@/lib/billing/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

const errorMessages: Record<string, string> = {
  not_found: 'Plano não encontrado.',
  validation: 'Dados inválidos.',
  throttle: 'Muitas requisições. Aguarde um momento.',
  config: 'Erro de configuração do serviço de pagamentos.',
  upstream: 'Não foi possível comunicar com a Pagar.me. Tente novamente.',
};

export interface BillingApiError {
  errorCode: string;
  message: string;
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function handleErrorResponse(res: Response): Promise<never> {
  let errorCode = 'upstream';
  let message = errorMessages['upstream'];

  try {
    const body = (await res.json()) as { errorCode?: string; message?: string };
    if (body.errorCode) {
      const normalized = body.errorCode.toLowerCase();
      errorCode = normalized;
      message = errorMessages[normalized] ?? body.message ?? message;
    } else if (body.message) {
      message = body.message;
    }
  } catch {
    // Body was not valid JSON — keep defaults.
  }

  const err: BillingApiError = { errorCode, message };
  throw err;
}

// ---------------------------------------------------------------------------
// Plans endpoints
// ---------------------------------------------------------------------------

export interface ListPlansParams {
  page?: number;
  pageSize?: number;
  name?: string;
  status?: string;
}

/**
 * GET /v1/admin/billing/plans
 * Returns a paginated list of plans.
 */
export async function listPlans(
  params: ListPlansParams,
  token: string,
): Promise<Paginated<Plan>> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.pageSize !== undefined) qs.set('pageSize', String(params.pageSize));
  if (params.name !== undefined && params.name !== '') qs.set('name', params.name);
  if (params.status !== undefined) qs.set('status', params.status);

  const query = qs.toString();
  const url = `${API_BASE}/v1/admin/billing/plans${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    headers: authHeaders(token),
    cache: 'no-store',
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<Paginated<Plan>>;
}

/**
 * GET /v1/admin/billing/plans/:id
 * Returns the full detail of a plan.
 */
export async function getPlan(id: string, token: string): Promise<Plan> {
  const res = await fetch(`${API_BASE}/v1/admin/billing/plans/${id}`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<Plan>;
}

/**
 * POST /v1/admin/billing/plans
 * Creates a new plan. Requires Idempotency-Key header.
 */
export async function createPlan(
  data: CreatePlanInput,
  token: string,
  idempotencyKey: string,
): Promise<Plan> {
  const res = await fetch(`${API_BASE}/v1/admin/billing/plans`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<Plan>;
}

/**
 * PATCH /v1/admin/billing/plans/:id
 * Updates an existing plan. Requires Idempotency-Key header.
 */
export async function updatePlan(
  id: string,
  data: Partial<CreatePlanInput>,
  token: string,
  idempotencyKey: string,
): Promise<Plan> {
  const res = await fetch(`${API_BASE}/v1/admin/billing/plans/${id}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(token),
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<Plan>;
}

/**
 * DELETE /v1/admin/billing/plans/:id
 * Archives a plan (soft-delete via Pagar.me). No physical deletion.
 */
export async function archivePlan(id: string, token: string): Promise<Plan> {
  const res = await fetch(`${API_BASE}/v1/admin/billing/plans/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<Plan>;
}
