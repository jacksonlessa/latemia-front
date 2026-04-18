/**
 * RegisterClientUseCase
 *
 * Validates input via ClientEntity, calls POST /v1/clients, and maps
 * API error codes to user-friendly per-field messages.
 *
 * No personal data is included in thrown errors or logs.
 */

import { ValidationError, ClientEntity } from "./client.entity";
import { getApiUrl, extractErrorCode } from "@/lib/api-client";
import type { ApiErrorBody } from "@/lib/api-client";
import type {
  RegisterClientInput,
  RegisterClientResult,
} from "@/lib/types/client";

// ---------------------------------------------------------------------------
// API error mapping
// ---------------------------------------------------------------------------

/**
 * Reads the API error response body and converts known business error codes
 * to per-field ValidationErrors, or re-throws an ApiError for unexpected ones.
 */
async function mapClientApiError(res: Response): Promise<ValidationError> {
  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // JSON parse failure — fall through to generic error
  }

  const code = extractErrorCode(body);

  switch (code) {
    case "CPF_EMAIL_MISMATCH":
      return new ValidationError({
        cpf: "CPF já cadastrado com outro e-mail",
      });

    case "EMAIL_ALREADY_REGISTERED":
      return new ValidationError({
        email: "E-mail já cadastrado",
      });

    case "INVALID_CPF":
      return new ValidationError({
        cpf: "CPF inválido",
      });

    default:
      // Generic error — no personal data in the message
      return new ValidationError({
        _form: "Ocorreu um erro inesperado. Tente novamente.",
      });
  }
}

// ---------------------------------------------------------------------------
// UseCase
// ---------------------------------------------------------------------------

export class RegisterClientUseCase {
  /**
   * Validates the input, calls the API, and returns the created (or existing)
   * client detail on success.
   *
   * Throws ValidationError for:
   *   - Invalid input (caught before any HTTP call)
   *   - Known API business errors (CPF_EMAIL_MISMATCH, EMAIL_ALREADY_REGISTERED)
   *
   * @param input - Raw registration form data.
   */
  async execute(input: RegisterClientInput): Promise<RegisterClientResult> {
    // 1. Domain validation — may throw ValidationError
    const entity = ClientEntity.validate(input);

    // 2. Call API
    let res: Response;
    try {
      res = await fetch(getApiUrl("/v1/clients"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entity.toApiPayload()),
      });
    } catch {
      // Network failure — no personal data in error
      throw new ValidationError({
        _form: "Erro de conexão. Verifique sua internet e tente novamente.",
      });
    }

    // 3. Map errors
    if (!res.ok) {
      throw await mapClientApiError(res);
    }

    // 4. Return typed result
    return res.json() as Promise<RegisterClientResult>;
  }
}
