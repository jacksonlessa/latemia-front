import "server-only";

import { getApiUrl } from "./api-client";
import type {
  DashboardKpisResponse,
  DashboardStatusChartResponse,
} from "./types/dashboard";
import type { PlanListResponse } from "./types/plan";

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function parseError(res: Response): Promise<Error> {
  let message = `HTTP ${res.status}`;
  try {
    const body = (await res.json()) as { message?: string };
    if (body.message) message = body.message;
  } catch {
    // keep default
  }
  return new Error(message);
}

/**
 * GET /v1/admin/dashboard/kpis
 * Returns the full KPI payload for the dashboard.
 */
export async function fetchKpis(token: string): Promise<DashboardKpisResponse> {
  const res = await fetch(getApiUrl("/v1/admin/dashboard/kpis"), {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<DashboardKpisResponse>;
}

/**
 * GET /v1/admin/dashboard/status-chart
 * Returns the 14-day plan-status time series.
 */
export async function fetchStatusChart(
  token: string,
): Promise<DashboardStatusChartResponse> {
  const res = await fetch(getApiUrl("/v1/admin/dashboard/status-chart"), {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<DashboardStatusChartResponse>;
}

export interface FetchInitialPlansQuery {
  page?: number;
  perPage?: number;
}

/**
 * GET /v1/plans
 * Returns the first page of plans for the dashboard table.
 * Defaults to page=1, perPage=20.
 */
export async function fetchInitialPlans(
  token: string,
  query: FetchInitialPlansQuery = {},
): Promise<PlanListResponse> {
  const page = query.page ?? 1;
  const perPage = query.perPage ?? 20;
  const qs = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });
  const res = await fetch(getApiUrl(`/v1/plans?${qs.toString()}`), {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<PlanListResponse>;
}
