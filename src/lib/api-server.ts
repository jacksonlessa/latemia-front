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
