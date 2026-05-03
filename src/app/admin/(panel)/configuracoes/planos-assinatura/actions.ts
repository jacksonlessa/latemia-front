'use server';

import { cookies } from 'next/headers';
import { listPlans, archivePlan, createPlan, getPlan, updatePlan } from '@/lib/billing/plans.api';
import { SESSION_COOKIE } from '@/lib/session';
import type { Paginated, Plan, CreatePlanInput } from '@/lib/billing/types';
import type { ListPlansParams } from '@/lib/billing/plans.api';

// ---------------------------------------------------------------------------
// ActionResult type
// ---------------------------------------------------------------------------

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; errorCode: string; message: string };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

function unauthenticated<T>(): ActionResult<T> {
  return {
    ok: false,
    errorCode: 'unauthenticated',
    message: 'Sessão expirada. Faça login novamente.',
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function listPlansAction(
  params: ListPlansParams,
): Promise<ActionResult<Paginated<Plan>>> {
  const token = await getToken();
  if (!token) return unauthenticated<Paginated<Plan>>();

  try {
    const data = await listPlans(params, token);
    return { ok: true, data };
  } catch (err) {
    const e = err as { errorCode?: string; message?: string };
    return {
      ok: false,
      errorCode: e.errorCode ?? 'upstream',
      message: e.message ?? 'Não foi possível comunicar com a Pagar.me. Tente novamente.',
    };
  }
}

export async function createPlanAction(
  input: CreatePlanInput,
  idempotencyKey: string,
): Promise<ActionResult<Plan>> {
  const token = await getToken();
  if (!token) return unauthenticated<Plan>();
  try {
    const data = await createPlan(input, token, idempotencyKey);
    return { ok: true, data };
  } catch (err) {
    const e = err as { errorCode?: string; message?: string };
    return { ok: false, errorCode: e.errorCode ?? 'upstream', message: e.message ?? 'Não foi possível comunicar com a Pagar.me. Tente novamente.' };
  }
}

export async function getPlanAction(id: string): Promise<ActionResult<Plan>> {
  const token = await getToken();
  if (!token) return unauthenticated<Plan>();
  try {
    const data = await getPlan(id, token);
    return { ok: true, data };
  } catch (err) {
    const e = err as { errorCode?: string; message?: string };
    return { ok: false, errorCode: e.errorCode ?? 'upstream', message: e.message ?? 'Não foi possível comunicar com a Pagar.me. Tente novamente.' };
  }
}

export async function updatePlanAction(
  id: string,
  input: Partial<CreatePlanInput>,
  idempotencyKey: string,
): Promise<ActionResult<Plan>> {
  const token = await getToken();
  if (!token) return unauthenticated<Plan>();
  try {
    const data = await updatePlan(id, input, token, idempotencyKey);
    return { ok: true, data };
  } catch (err) {
    const e = err as { errorCode?: string; message?: string };
    return { ok: false, errorCode: e.errorCode ?? 'upstream', message: e.message ?? 'Não foi possível comunicar com a Pagar.me. Tente novamente.' };
  }
}

export async function archivePlanAction(
  id: string,
): Promise<ActionResult<Plan>> {
  const token = await getToken();
  if (!token) return unauthenticated<Plan>();

  try {
    const data = await archivePlan(id, token);
    return { ok: true, data };
  } catch (err) {
    const e = err as { errorCode?: string; message?: string };
    return {
      ok: false,
      errorCode: e.errorCode ?? 'upstream',
      message: e.message ?? 'Não foi possível comunicar com a Pagar.me. Tente novamente.',
    };
  }
}
