/**
 * Shared API client utilities used by domain use-cases.
 *
 * Centralises API base URL resolution and error body parsing so that
 * individual use-case files do not duplicate these concerns.
 */

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
