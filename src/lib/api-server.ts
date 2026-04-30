import "server-only";

import { ApiError } from "./api-errors";
import type { SessionUser } from "./session";
import type {
  CreateInternalUserInput,
  InternalUserDetail,
  ListInternalUsersParams,
  PaginatedInternalUsers,
  UpdateInternalUserInput,
} from "./types/users";
import type { ClientDetail, PaginatedClients } from "./types/client";
import type { PetDetail } from "./types/pet";
import type {
  SystemSettingsDto,
  UpdateSystemSettingsInput,
} from "./types/system-settings";
import type {
  ListNotificationBufferQuery,
  NotificationBufferEntryDto,
  NotificationBufferListResponse,
  NotificationEventConfigDto,
  NotificationEventType,
  QuietHoursDto,
} from "./types/notifications";
import type {
  BenefitUsageResponse,
  Paginated,
} from "./types/benefit-usage";

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

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Parses an error response body and throws an ApiError.
 * The backend returns `{ code, message }` on error responses.
 */
async function handleErrorResponse(res: Response): Promise<never> {
  let code = "UNKNOWN_ERROR";
  let message = `HTTP ${res.status}`;
  let fieldErrors: Record<string, string> | undefined;

  try {
    const body = (await res.json()) as {
      code?: string;
      message?: string;
      fieldErrors?: Record<string, string>;
    };
    if (body.code) code = body.code;
    if (body.message) message = body.message;
    if (body.fieldErrors) fieldErrors = body.fieldErrors;
  } catch {
    // Body was not valid JSON — keep defaults.
  }

  throw new ApiError(res.status, code, message, fieldErrors);
}

// ---------------------------------------------------------------------------
// Users endpoints
// ---------------------------------------------------------------------------

/**
 * GET /v1/users
 * Returns a paginated list of users.
 * Only defined query params are included in the request.
 */
export async function listUsers(
  token: string,
  params: ListInternalUsersParams = {},
): Promise<PaginatedInternalUsers> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.search !== undefined && params.search !== "")
    qs.set("search", params.search);
  if (params.status !== undefined) qs.set("status", params.status);
  if (params.role !== undefined) qs.set("role", params.role);

  const query = qs.toString();
  const url = `${apiUrl()}/v1/users${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<PaginatedInternalUsers>;
}

/**
 * GET /v1/users/:id
 * Returns the full detail of a user (unmasked CPF/phone).
 */
export async function getUser(
  token: string,
  id: string,
): Promise<InternalUserDetail> {
  const res = await fetch(`${apiUrl()}/v1/users/${id}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<InternalUserDetail>;
}

/**
 * POST /v1/users
 * Creates a new user.
 */
export async function createUser(
  token: string,
  input: CreateInternalUserInput,
): Promise<InternalUserDetail> {
  const res = await fetch(`${apiUrl()}/v1/users`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<InternalUserDetail>;
}

/**
 * PATCH /v1/users/:id
 * Updates an existing user. All fields are optional.
 */
export async function updateUser(
  token: string,
  id: string,
  input: UpdateInternalUserInput,
): Promise<InternalUserDetail> {
  const res = await fetch(`${apiUrl()}/v1/users/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<InternalUserDetail>;
}

/**
 * DELETE /v1/users/:id
 * Soft-deletes (deactivates) a user.
 * The backend returns 204 No Content on success.
 */
export async function deactivateUser(
  token: string,
  id: string,
): Promise<void> {
  const res = await fetch(`${apiUrl()}/v1/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (res.status === 204) return;
  if (!res.ok) return handleErrorResponse(res);
}

/**
 * POST /v1/users/:id/reactivate
 * Reactivates a previously deactivated user.
 */
export async function reactivateUser(
  token: string,
  id: string,
): Promise<InternalUserDetail> {
  const res = await fetch(`${apiUrl()}/v1/users/${id}/reactivate`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<InternalUserDetail>;
}

// ---------------------------------------------------------------------------
// System settings endpoints
// ---------------------------------------------------------------------------

/**
 * GET /v1/settings
 * Returns the current system settings.
 */
export async function fetchSystemSettings(
  token: string,
): Promise<SystemSettingsDto> {
  const res = await fetch(`${apiUrl()}/v1/settings`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<SystemSettingsDto>;
}

/**
 * PUT /v1/settings
 * Updates system settings. At least one field must be provided.
 * Backend error codes: INVALID_PAYMENT_PROVIDER, INVALID_SUBSCRIPTION_PLAN_ID, EMPTY_UPDATE.
 */
export async function updateSystemSettings(
  token: string,
  payload: UpdateSystemSettingsInput,
): Promise<SystemSettingsDto> {
  const res = await fetch(`${apiUrl()}/v1/settings`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<SystemSettingsDto>;
}

// ---------------------------------------------------------------------------
// Clients endpoints
// ---------------------------------------------------------------------------

/**
 * GET /v1/clients
 * Returns a paginated list of clients with masked CPF and phone.
 */
export async function fetchClients(params: {
  search?: string;
  page?: number;
  limit?: number;
  token: string;
}): Promise<PaginatedClients> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.search !== undefined && params.search !== "")
    qs.set("search", params.search);

  const query = qs.toString();
  const url = `${apiUrl()}/v1/clients${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: authHeaders(params.token),
    cache: "no-store",
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<PaginatedClients>;
}

/**
 * GET /v1/clients/:id
 * Returns the full detail of a client including addresses and pets.
 */
export async function fetchClientDetail(
  id: string,
  token: string,
): Promise<ClientDetail> {
  const res = await fetch(`${apiUrl()}/v1/clients/${id}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<ClientDetail>;
}

// ---------------------------------------------------------------------------
// Notifications endpoints (admin)
// ---------------------------------------------------------------------------

/**
 * GET /v1/notifications/events
 * Returns the list of event-type toggles.
 */
export async function fetchNotificationEvents(
  token: string,
): Promise<NotificationEventConfigDto[]> {
  const res = await fetch(`${apiUrl()}/v1/notifications/events`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<NotificationEventConfigDto[]>;
}

/**
 * PATCH /v1/notifications/events/:type
 * Toggles a specific event type on/off.
 */
export async function patchNotificationEvent(
  token: string,
  type: NotificationEventType,
  enabled: boolean,
): Promise<NotificationEventConfigDto> {
  const res = await fetch(
    `${apiUrl()}/v1/notifications/events/${encodeURIComponent(type)}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ enabled }),
    },
  );
  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<NotificationEventConfigDto>;
}

/**
 * GET /v1/notifications/quiet-hours
 * Returns the quiet-hours configuration.
 */
export async function fetchQuietHours(token: string): Promise<QuietHoursDto> {
  const res = await fetch(`${apiUrl()}/v1/notifications/quiet-hours`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<QuietHoursDto>;
}

/**
 * PUT /v1/notifications/quiet-hours
 * Updates the quiet-hours configuration.
 */
export async function putQuietHours(
  token: string,
  payload: QuietHoursDto,
): Promise<QuietHoursDto> {
  const res = await fetch(`${apiUrl()}/v1/notifications/quiet-hours`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<QuietHoursDto>;
}

/**
 * GET /v1/notifications/buffer
 * Lists buffered notifications. Filters by status/reason; cursor pagination.
 */
export async function fetchNotificationBuffer(
  token: string,
  query: ListNotificationBufferQuery = {},
): Promise<NotificationBufferListResponse> {
  const qs = new URLSearchParams();
  if (query.status) qs.set("status", query.status);
  if (query.reason) qs.set("reason", query.reason);
  if (query.limit !== undefined) qs.set("limit", String(query.limit));
  if (query.cursor) qs.set("cursor", query.cursor);
  if (query.includeText) qs.set("includeText", "true");

  const url = `${apiUrl()}/v1/notifications/buffer${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<NotificationBufferListResponse>;
}

/**
 * GET /v1/notifications/buffer/:id with includeText=true (helper).
 * Backend reuses the list endpoint with a cursor; for single-item access we
 * call the list endpoint with includeText=true and return the first match.
 */
export async function fetchNotificationBufferEntryText(
  token: string,
  id: string,
): Promise<NotificationBufferEntryDto | null> {
  // Backend exposes lookup via GET /v1/notifications/buffer?includeText=true
  // and the entry id is filtered client-side for now (no dedicated GET-by-id
  // endpoint). Callers should already have the entry; this helper exists
  // for future-proofing.
  const list = await fetchNotificationBuffer(token, {
    includeText: true,
    limit: 100,
  });
  return list.items.find((item) => item.id === id) ?? null;
}

/**
 * GET /v1/clients/:clientId/pets/:petId
 * Returns full pet detail. Throws ApiError(404) when pet does not exist
 * or does not belong to the given client.
 */
export async function fetchPetDetail(
  clientId: string,
  petId: string,
  token: string,
): Promise<PetDetail> {
  const res = await fetch(
    `${apiUrl()}/v1/clients/${clientId}/pets/${petId}`,
    {
      headers: authHeaders(token),
      cache: "no-store",
    },
  );

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<PetDetail>;
}

// ---------------------------------------------------------------------------
// Benefit usages endpoints
// ---------------------------------------------------------------------------

/**
 * GET /v1/benefit-usages
 * Paginated global listing with optional filters by period and plan.
 * Admin-only on the backend.
 */
export async function fetchBenefitUsages(params: {
  from?: string;
  to?: string;
  planId?: string;
  page?: number;
  limit?: number;
  token: string;
}): Promise<Paginated<BenefitUsageResponse>> {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.planId) qs.set("planId", params.planId);
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.limit !== undefined) qs.set("perPage", String(params.limit));

  const query = qs.toString();
  const url = `${apiUrl()}/v1/benefit-usages${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: authHeaders(params.token),
    cache: "no-store",
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<Paginated<BenefitUsageResponse>>;
}

/**
 * GET /v1/benefit-usages/by-plan/:planId
 * Returns all usages for a given plan ordered by attendedAt desc (no pagination).
 */
export async function fetchBenefitUsagesByPlan(params: {
  planId: string;
  token: string;
}): Promise<BenefitUsageResponse[]> {
  const res = await fetch(
    `${apiUrl()}/v1/benefit-usages/by-plan/${params.planId}`,
    {
      headers: authHeaders(params.token),
      cache: "no-store",
    },
  );

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<BenefitUsageResponse[]>;
}

/**
 * GET /v1/benefit-usages/:id
 * Returns a single benefit-usage detail.
 */
export async function fetchBenefitUsageById(params: {
  id: string;
  token: string;
}): Promise<BenefitUsageResponse> {
  const res = await fetch(`${apiUrl()}/v1/benefit-usages/${params.id}`, {
    headers: authHeaders(params.token),
    cache: "no-store",
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<BenefitUsageResponse>;
}
