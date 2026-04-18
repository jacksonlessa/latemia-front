/**
 * RegisterPetUseCase
 *
 * Validates input via PetEntity, calls POST /v1/register/pet,
 * and maps API error codes to user-friendly per-field messages.
 * clientId is sent in the request body instead of the URL path.
 *
 * No personal data is included in thrown errors or logs.
 */

import { ValidationError, PetEntity } from "./pet.entity";
import { getApiUrl, extractErrorCode } from "@/lib/api-client";
import type { ApiErrorBody } from "@/lib/api-client";
import type { RegisterPetInput, RegisterPetResult } from "@/lib/types/pet";

// ---------------------------------------------------------------------------
// API error mapping
// ---------------------------------------------------------------------------

async function mapPetApiError(res: Response): Promise<ValidationError> {
  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // JSON parse failure — fall through to generic error
  }

  const code = extractErrorCode(body);

  switch (code) {
    case "CLIENT_NOT_FOUND":
      return new ValidationError({
        _form: "Cliente não encontrado. Reinicie o cadastro.",
      });

    case "INVALID_AGE_MONTHS":
      return new ValidationError({
        age_months: "Meses de vida inválidos (0 a 11)",
      });

    case "INVALID_WEIGHT":
      return new ValidationError({
        weight: "Peso deve ser maior que zero",
      });

    default:
      return new ValidationError({
        _form: "Ocorreu um erro inesperado. Tente novamente.",
      });
  }
}

// ---------------------------------------------------------------------------
// UseCase
// ---------------------------------------------------------------------------

export class RegisterPetUseCase {
  /**
   * Validates the input, calls the API, and returns the created pet detail
   * on success.
   *
   * Throws ValidationError for invalid input or known API business errors.
   *
   * @param clientId - UUID of the already-registered client.
   * @param input    - Raw pet registration form data.
   */
  async execute(
    clientId: string,
    input: RegisterPetInput,
  ): Promise<RegisterPetResult> {
    // 1. Domain validation — may throw ValidationError
    const entity = PetEntity.validate(input);

    // 2. Call API
    let res: Response;
    try {
      res = await fetch(getApiUrl("/v1/register/pet"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, ...entity.toApiPayload() }),
      });
    } catch {
      // Network failure — no personal data in error
      throw new ValidationError({
        _form: "Erro de conexão. Verifique sua internet e tente novamente.",
      });
    }

    // 3. Map errors
    if (!res.ok) {
      throw await mapPetApiError(res);
    }

    // 4. Return typed result
    return res.json() as Promise<RegisterPetResult>;
  }
}
