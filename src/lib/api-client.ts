/**
 * Shared API client utilities used by domain use-cases.
 *
 * Centralises API base URL resolution and error body parsing so that
 * individual use-case files do not duplicate these concerns.
 */

import type { ClientListItem } from "@/lib/types/client";

export type { ClientListItem } from "@/lib/types/client";

export interface ApiErrorBody {
  code?: string;
  message?: string | Record<string, unknown>;
}

/**
 * Returns the full URL for a given API path, using the NEXT_PUBLIC_API_URL
 * environment variable as the base (falls back to localhost:3001 in dev).
 */
export function getApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  return `${base}${path}`;
}

/**
 * Extracts the business error code from an API error response body.
 *
 * NestJS can wrap error objects under `response.message` when using
 * built-in exceptions like `ConflictException({ code: 'X' })`, so the
 * actual response body may look like:
 *   { statusCode: 409, message: { code: 'X', message: 'Y' } }
 *
 * This function handles both the flat shape `{ code }` and the nested
 * shape `{ message: { code } }`.
 */
export function extractErrorCode(body: ApiErrorBody): string {
  return (
    body.code ??
    (typeof body.message === "object" ? body.message?.code as string | undefined : undefined) ??
    "UNKNOWN_ERROR"
  );
}

/**
 * Quick-search helper for the admin Topbar's client lookup dropdown.
 *
 * Calls the internal Route Handler `/api/admin/clients/search`, which
 * proxies the request to the backend `GET /v1/clients` endpoint with the
 * JWT attached server-side from the httpOnly session cookie.
 *
 * Returns only the `data` array from the paginated envelope; the `meta`
 * block is intentionally discarded — the header dropdown does not paginate.
 *
 * Accepts an `AbortSignal` so callers can cancel an in-flight request when
 * the user keeps typing (race-condition prevention).
 *
 * Throws an `Error` whose message is the business error code extracted by
 * `extractErrorCode` when the upstream response is not OK. The caller is
 * responsible for mapping it to a user-facing message.
 *
 * LGPD: the term may contain PII. It is sent as a query string param and
 * is never logged on the client side.
 */
export async function searchClientsForHeader(
  term: string,
  signal: AbortSignal,
): Promise<ClientListItem[]> {
  const qs = new URLSearchParams({ q: term, perPage: "8" });
  const res = await fetch(`/api/admin/clients/search?${qs.toString()}`, {
    signal,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(extractErrorCode(body));
  }

  const json = (await res.json()) as { data: ClientListItem[] };
  return json.data;
}
