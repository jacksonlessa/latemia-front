/**
 * updateDelinquencyTemplateUseCase
 *
 * Calls PUT /api/admin/delinquency/templates/:stageDays (the internal
 * Next.js Route Handler) to persist changes to a delinquency billing-flow
 * message template.
 *
 * The Route Handler proxies the request to the backend, attaching the JWT
 * bearer token from the httpOnly session cookie.
 *
 * On backend 422 (`TEMPLATE_MISSING_LINK_PLACEHOLDER`) or 404 (unknown
 * `stageDays`) throws `ApiError` — callers should map `err.code` to a
 * user-facing message. Client-side validation should already block a submit
 * without `[LINK]`, so a 422 here indicates a race with another edit.
 *
 * LGPD: no personal data is involved — templates only contain placeholder
 * tokens, never real client/pet data.
 */

import { ApiError } from '@/lib/api-errors';
import type {
  DelinquencyTemplateDto,
  UpdateDelinquencyTemplateInput,
} from '@/lib/types/delinquency';

export async function updateDelinquencyTemplateUseCase(
  stageDays: number,
  input: UpdateDelinquencyTemplateInput,
): Promise<DelinquencyTemplateDto> {
  const res = await fetch(
    `/api/admin/delinquency/templates/${encodeURIComponent(String(stageDays))}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      cache: 'no-store',
    },
  );

  if (res.ok) {
    return res.json() as Promise<DelinquencyTemplateDto>;
  }

  let body: { code?: string; message?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // non-JSON body — keep defaults
  }

  const code = body.code ?? 'UNKNOWN_ERROR';

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
