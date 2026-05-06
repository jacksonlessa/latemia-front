/**
 * fetchPetDetailUseCase
 *
 * Server-side use case that fetches a single pet's detail from
 * GET /v1/clients/:clientId/pets/:petId, forwarding the admin JWT token.
 *
 * Intended to be called from Server Components only. `server-only` is
 * intentionally not imported so this module remains testable via Vitest;
 * the calling Server Component is responsible for enforcing server-side
 * execution.
 */

import type { PetDetail } from '@/lib/types/pet';

function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export interface FetchPetDetailParams {
  clientId: string;
  petId: string;
  token: string;
}

export class FetchPetDetailError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'FetchPetDetailError';
  }
}

export async function fetchPetDetailUseCase(
  params: FetchPetDetailParams,
): Promise<PetDetail> {
  const url = `${apiUrl()}/v1/clients/${params.clientId}/pets/${params.petId}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${params.token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new FetchPetDetailError(
      res.status,
      `Failed to fetch pet detail: HTTP ${res.status}`,
    );
  }

  return res.json() as Promise<PetDetail>;
}
