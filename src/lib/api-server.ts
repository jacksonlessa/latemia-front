import "server-only";

import { ApiError } from "./api-errors";
import type { SessionUser } from "./session";
import type {
  CreateInternalUserInput,
  InternalUserDetail,
  ListInternalUsersParams,
  PaginatedInternalUsers,
  UpdateInternalUserInput,
} from "./types/internal-users";

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
// Internal Users endpoints
// ---------------------------------------------------------------------------

/**
 * GET /v1/internal-users
 * Returns a paginated list of internal users.
 * Only defined query params are included in the request.
 */
export async function listInternalUsers(
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
  const url = `${apiUrl()}/v1/internal-users${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<PaginatedInternalUsers>;
}

/**
 * GET /v1/internal-users/:id
 * Returns the full detail of an internal user (unmasked CPF/phone).
 */
export async function getInternalUser(
  token: string,
  id: string,
): Promise<InternalUserDetail> {
  const res = await fetch(`${apiUrl()}/v1/internal-users/${id}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<InternalUserDetail>;
}

/**
 * POST /v1/internal-users
 * Creates a new internal user.
 */
export async function createInternalUser(
  token: string,
  input: CreateInternalUserInput,
): Promise<InternalUserDetail> {
  const res = await fetch(`${apiUrl()}/v1/internal-users`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<InternalUserDetail>;
}

/**
 * PATCH /v1/internal-users/:id
 * Updates an existing internal user. All fields are optional.
 */
export async function updateInternalUser(
  token: string,
  id: string,
  input: UpdateInternalUserInput,
): Promise<InternalUserDetail> {
  const res = await fetch(`${apiUrl()}/v1/internal-users/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<InternalUserDetail>;
}

/**
 * DELETE /v1/internal-users/:id
 * Soft-deletes (deactivates) an internal user.
 * The backend returns 204 No Content on success.
 */
export async function deactivateInternalUser(
  token: string,
  id: string,
): Promise<void> {
  const res = await fetch(`${apiUrl()}/v1/internal-users/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (res.status === 204) return;
  if (!res.ok) return handleErrorResponse(res);
}

/**
 * POST /v1/internal-users/:id/reactivate
 * Reactivates a previously deactivated internal user.
 */
export async function reactivateInternalUser(
  token: string,
  id: string,
): Promise<InternalUserDetail> {
  const res = await fetch(`${apiUrl()}/v1/internal-users/${id}/reactivate`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) return handleErrorResponse(res);
  return res.json() as Promise<InternalUserDetail>;
}
