/**
 * deactivatePetUseCase
 *
 * Calls DELETE /api/admin/clients/:clientId/pets/:petId (the internal Next.js
 * Route Handler) to soft-delete a pet. Maps backend error codes to typed errors
 * so callers can surface appropriate messages.
 *
 * LGPD: no personal data is ever logged — only UUIDs and error codes.
 */

import { ApiError } from '@/lib/api-errors';
import { ApiNotFoundError } from '@/domain/client/update-client.use-case';

// Re-export for convenience so callers only need this module.
export { ApiNotFoundError };

/**
 * Error thrown when the backend returns 409 with code `PET_HAS_PLANS`.
 * Indicates the pet cannot be deactivated because it has at least one
 * associated plan (regardless of the plan status).
 */
export class PetHasPlansError extends Error {
  readonly code = 'PET_HAS_PLANS';
  readonly status = 409;

  constructor(message = 'Este pet possui planos associados e não pode ser inativado.') {
    super(message);
    this.name = 'PetHasPlansError';
  }
}

export interface DeactivatePetParams {
  clientId: string;
  petId: string;
}

/**
 * Deactivates the pet identified by `petId` (belonging to `clientId`).
 * Resolves `void` on 204.
 *
 * Throws:
 * - `PetHasPlansError`  for 409 responses with `code: 'PET_HAS_PLANS'`.
 * - `ApiNotFoundError`  for 404 responses (pet not found or wrong clientId).
 * - `ApiError`          for any other non-2xx response.
 */
export async function deactivatePetUseCase(
  params: DeactivatePetParams,
): Promise<void> {
  const { clientId, petId } = params;

  const res = await fetch(
    `/api/admin/clients/${encodeURIComponent(clientId)}/pets/${encodeURIComponent(petId)}`,
    {
      method: 'DELETE',
      cache: 'no-store',
    },
  );

  if (res.status === 204) {
    return;
  }

  // Parse error body — best-effort; keep defaults on JSON failure.
  let body: { code?: string; message?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // non-JSON body — keep defaults
  }

  const code = body.code ?? 'UNKNOWN_ERROR';

  if (res.status === 404) {
    throw new ApiNotFoundError('Pet não encontrado ou não pertence ao cliente.');
  }

  if (res.status === 409 && code === 'PET_HAS_PLANS') {
    throw new PetHasPlansError(
      body.message ?? 'Este pet possui planos associados e não pode ser inativado.',
    );
  }

  throw new ApiError(res.status, code, body.message ?? `HTTP ${res.status}`);
}
