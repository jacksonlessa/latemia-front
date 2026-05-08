/**
 * HTTP transport wrapper for the LateMia frontend.
 *
 * Wraps the global `fetch` to automatically inject observability headers:
 *   - `X-Request-Id` — per-attempt correlation ID (UUID v4, persisted in sessionStorage)
 *   - `Idempotency-Key` — per-operation deduplication key (opt-in via `idempotent: true`)
 *
 * On network failure or HTTP 5xx responses, `reportClientError` is called
 * in a best-effort manner so errors are recorded on the backend for
 * end-to-end tracing.
 *
 * Callers receive the raw `Response` object and are responsible for consuming
 * the body (`.json()`, `.text()`, etc.) as before.
 */

import { getOrCreateAttemptId } from '@/lib/observability/request-id';
import { createIdempotencyKey } from '@/lib/observability/idempotency-key';
import { reportClientError } from '@/lib/observability/client-error-reporter';

export type HttpInit = RequestInit & {
  /**
   * When true, an `Idempotency-Key` header is injected.
   * Use for POST/PATCH operations that must not be executed twice on retry.
   */
  idempotent?: boolean;

  /**
   * Explicit idempotency key to use. When omitted and `idempotent` is true,
   * a fresh UUID v4 is generated via `createIdempotencyKey()`.
   */
  idempotencyKey?: string;

  /**
   * Set to `false` to suppress the automatic `reportClientError` call on
   * network failure or 5xx responses. Defaults to `true` (reporting enabled).
   */
  reportClientErrorOn5xx?: boolean;
};

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Performs a `fetch` request with automatic injection of observability headers.
 *
 * @param input  - URL or `Request` object (same as native `fetch`)
 * @param init   - Extended `RequestInit` with observability options
 * @returns      The raw `Response` — body is not consumed by this function
 */
export async function httpFetch(
  input: RequestInfo,
  init: HttpInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);

  if (!headers.has('X-Request-Id')) {
    headers.set('X-Request-Id', getOrCreateAttemptId());
  }

  if (init.idempotent && !headers.has('Idempotency-Key')) {
    headers.set(
      'Idempotency-Key',
      init.idempotencyKey ?? createIdempotencyKey(),
    );
  }

  const shouldReport = init.reportClientErrorOn5xx !== false;

  let res: Response;

  try {
    res = await fetch(input, { ...init, headers });
  } catch (err) {
    if (shouldReport) {
      reportClientError({
        requestId: headers.get('X-Request-Id') ?? 'unknown',
        stage: 'network',
        message: describeError(err),
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      }).catch(() => {});
    }
    throw err;
  }

  if (res.status >= 500 && shouldReport) {
    reportClientError({
      requestId: headers.get('X-Request-Id') ?? 'unknown',
      stage: 'http_5xx',
      message: `HTTP ${res.status}`,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }).catch(() => {});
  }

  return res;
}
