/**
 * updatePetUseCase
 *
 * Calls PATCH /v1/clients/:clientId/pets/:petId with the given payload
 * and bearer token. Maps backend error codes (400, 404) to typed errors
 * so that the EditPetDrawer (and other callers) can surface per-field messages.
 *
 * LGPD: no payload content is ever logged — only IDs and error codes.
 */

import { ApiError } from '@/lib/api-errors';
import {
  ApiValidationError,
  ApiNotFoundError,
} from '@/domain/client/update-client.use-case';
import type { PetDetail, UpdatePetPayload } from '@/lib/types/pet';

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export interface UpdatePetParams {
  clientId: string;
  petId: string;
  payload: UpdatePetPayload;
  token: string;
}

// Re-export shared error types so consumers only need this module.
export { ApiValidationError, ApiNotFoundError };

/**
 * Updates the pet identified by `petId` (belonging to `clientId`) with the
 * provided partial payload. Returns the updated PetDetail on success.
 *
 * Throws:
 * - `ApiValidationError` for 400 responses (maps `fieldErrors` from backend).
 * - `ApiNotFoundError` for 404 responses (pet not found or wrong clientId).
 * - `ApiError` for any other non-2xx response.
 */
export async function updatePetUseCase(
  params: UpdatePetParams,
): Promise<PetDetail> {
  const { clientId, petId, payload, token } = params;

  const res = await fetch(
    `${apiUrl()}/v1/clients/${encodeURIComponent(clientId)}/pets/${encodeURIComponent(petId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    },
  );

  if (res.ok) {
    return res.json() as Promise<PetDetail>;
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
    throw new ApiNotFoundError('Pet não encontrado ou não pertence ao cliente.');
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
