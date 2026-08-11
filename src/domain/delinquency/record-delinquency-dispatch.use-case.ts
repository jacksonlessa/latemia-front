/**
 * recordDelinquencyDispatchUseCase
 *
 * Calls POST /api/admin/delinquency/clients/:clientId/dispatches (the
 * internal Next.js Route Handler) to register a manual delinquency-message
 * dispatch (WhatsApp link opened or message copied) for a given client and
 * stage.
 *
 * The Route Handler proxies the request to the backend, attaching the JWT
 * bearer token from the httpOnly session cookie.
 *
 * Must be awaited and resolved BEFORE opening the WhatsApp link or copying
 * the message text — this guarantees the dispatch is recorded even if the
 * user closes the tab or the clipboard write fails.
 *
 * On backend 422 `STAGE_NOT_APPLICABLE` (the stage is no longer the
 * client's current applicable stage — e.g. another operator already
 * dispatched it, or the client regularized) throws
 * `StageNotApplicableError`, which callers should handle by reloading the
 * client's row.
 *
 * LGPD: no personal data (rendered message text, client name/phone) is
 * logged here — only clientId/stageDays/channel are sent to the backend.
 */

import { ApiError } from "@/lib/api-errors";
import type {
  DelinquencyDispatchResult,
  RecordDelinquencyDispatchInput,
} from "@/lib/types/delinquency";

/**
 * Thrown when the backend returns 422 `STAGE_NOT_APPLICABLE`, meaning the
 * requested stage is no longer the client's current pending stage.
 */
export class StageNotApplicableError extends Error {
  readonly code = "STAGE_NOT_APPLICABLE";
  readonly status = 422;

  constructor(
    message = "Este estágio não está mais pendente para este cliente. A lista será atualizada.",
  ) {
    super(message);
    this.name = "StageNotApplicableError";
  }
}

/**
 * Registers a delinquency-message dispatch for the given client.
 *
 * Throws:
 * - `StageNotApplicableError` when the backend returns 422.
 * - `ApiError` for any other non-2xx response.
 */
export async function recordDelinquencyDispatchUseCase(
  clientId: string,
  input: RecordDelinquencyDispatchInput,
): Promise<DelinquencyDispatchResult> {
  const res = await fetch(
    `/api/admin/delinquency/clients/${encodeURIComponent(clientId)}/dispatches`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  );

  if (res.ok) {
    return res.json() as Promise<DelinquencyDispatchResult>;
  }

  let body: { code?: string; message?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // non-JSON body — keep defaults
  }

  const code = body.code ?? "UNKNOWN_ERROR";

  if (res.status === 422 && code === "STAGE_NOT_APPLICABLE") {
    throw new StageNotApplicableError(body.message);
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
