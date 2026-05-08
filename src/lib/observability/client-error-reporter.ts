/**
 * Best-effort client-side error reporter.
 *
 * Sends a structured error payload to the backend `POST /v1/log/client-error`
 * endpoint. Uses `keepalive: true` so the request is delivered even when the
 * user navigates away. All errors are silently swallowed — observability must
 * never break the main flow.
 */

export interface ClientErrorPayload {
  requestId: string;
  stage: string;
  message: string;
  stackHash?: string;
  userAgent?: string;
}

/**
 * Sends `payload` to the backend error-logging endpoint.
 *
 * Fire-and-forget: this function always resolves, never rejects.
 */
export async function reportClientError(
  payload: ClientErrorPayload,
): Promise<void> {
  try {
    const base =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

    await fetch(`${base}/v1/log/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // best-effort: silently ignore all errors
  }
}
