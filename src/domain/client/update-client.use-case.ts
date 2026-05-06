/**
 * updateClientUseCase
 *
 * Calls PATCH /v1/clients/:id with the given payload and bearer token.
 * Maps backend error codes (400, 404, 409) to typed errors so that
 * the EditClientDrawer (and other callers) can surface per-field messages.
 *
 * LGPD: no payload content is ever logged — only IDs and error codes.
 */

import { ApiError } from '@/lib/api-errors';
import type { ClientDetail, UpdateClientPayload } from '@/lib/types/client';

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export interface UpdateClientParams {
  id: string;
  payload: UpdateClientPayload;
  token: string;
}

/**
 * Error thrown when the backend returns a 400 validation error.
 * Carries per-field details keyed by the field name, matching the
 * backend `fieldErrors` shape.
 */
export class ApiValidationError extends Error {
  readonly status = 400;
  readonly code = 'VALIDATION_ERROR';
  readonly fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super('Validation failed');
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Error thrown when the backend returns a 404 for the requested resource.
 */
export class ApiNotFoundError extends Error {
  readonly status = 404;
  readonly code = 'NOT_FOUND';

  constructor(message = 'Recurso não encontrado.') {
    super(message);
    this.name = 'ApiNotFoundError';
  }
}

/**
 * Error thrown when the backend returns a 409 CLIENT_EMAIL_TAKEN.
 * The EditClientDrawer maps this to a per-field email message.
 */
export class ApiConflictError extends Error {
  readonly status = 409;
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiConflictError';
    this.code = code;
  }
}

/**
 * Updates the client identified by `id` with the provided partial payload.
 * Returns the updated ClientDetail on success.
 *
 * Throws:
 * - `ApiValidationError` for 400 responses (maps `fieldErrors` from backend).
 * - `ApiNotFoundError` for 404 responses.
 * - `ApiConflictError` with `code: 'CLIENT_EMAIL_TAKEN'` for 409 responses.
 * - `ApiError` for any other non-2xx response.
 */
export async function updateClientUseCase(
  params: UpdateClientParams,
): Promise<ClientDetail> {
  const { id, payload, token } = params;

  const res = await fetch(`${apiUrl()}/v1/clients/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (res.ok) {
    return res.json() as Promise<ClientDetail>;
  }

  // Parse error body — best-effort; keep defaults on JSON failure.
  let body: { code?: string; message?: string; fieldErrors?: Record<string, string> } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // non-JSON body — keep defaults
  }

  const code = body.code ?? 'UNKNOWN_ERROR';

  if (res.status === 400) {
    const fieldErrors: Record<string, string> =
      body.fieldErrors ?? { _form: body.message ?? 'Verifique os dados informados.' };
    throw new ApiValidationError(fieldErrors);
  }

  if (res.status === 404) {
    throw new ApiNotFoundError('Cliente não encontrado.');
  }

  if (res.status === 409) {
    throw new ApiConflictError(
      code,
      body.message ?? 'Conflito ao atualizar o cliente.',
    );
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
