/**
 * RegisterClientUseCase
 *
 * Validates input via ClientEntity, calls POST /v1/register/client, and maps
 * API error codes to user-friendly per-field messages.
 *
 * No personal data is included in thrown errors or logs.
 */

import { ValidationError, ClientEntity } from "./client.entity";
import { getApiUrl, extractErrorCode } from "@/lib/api-client";
import type { ApiErrorBody } from "@/lib/api-client";
import type {
  CreateClientPayload,
  RegisterClientInput,
  RegisterClientResult,
} from "@/lib/types/client";

// ---------------------------------------------------------------------------
// Shared serialiser — reused by validate-client.use-case
// ---------------------------------------------------------------------------

/**
 * Converts raw RegisterClientInput into the canonical API payload.
 * Normalises CPF mask, strips non-digit phone characters, trims fields.
 *
 * Exported so that validate-client.use-case can reuse it without duplicating
 * the serialisation logic.
 */
export function toApiPayload(input: RegisterClientInput): CreateClientPayload {
  // We delegate full normalisation to ClientEntity; if caller passes
  // already-normalised data (e.g. from validate-client after entity validate),
  // this is a no-op for already clean values.
  const entity = ClientEntity.validate(input);
  return entity.toApiPayload();
}

// ---------------------------------------------------------------------------
// API error mapping
// ---------------------------------------------------------------------------

/**
 * Reads the API error response body and converts known business error codes
 * to per-field ValidationErrors.
 *
 * Exported so that validate-client.use-case can reuse the same mapping,
 * guaranteeing symmetric error handling between dry-run and registration.
 *
 * LGPD: only `code` is ever logged — never the actual field value.
 */
export async function mapClientApiError(res: Response): Promise<ValidationError> {
  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // JSON parse failure — fall through to generic error
  }

  const code = extractErrorCode(body);

  switch (code) {
    case "INVALID_NAME":
      return new ValidationError({ name: "Informe seu nome completo" });

    case "INVALID_CPF":
      return new ValidationError({ cpf: "CPF inválido" });

    case "INVALID_PHONE":
      return new ValidationError({
        phone: "Telefone inválido. Use DDD + número (10 ou 11 dígitos).",
      });

    case "INVALID_EMAIL":
      return new ValidationError({ email: "E-mail inválido" });

    case "INVALID_CEP":
      return new ValidationError({ "address.cep": "CEP inválido" });

    case "INVALID_STREET":
      return new ValidationError({ "address.street": "Informe a rua" });

    case "INVALID_NUMBER":
      return new ValidationError({ "address.number": "Informe o número" });

    case "INVALID_COMPLEMENT":
      return new ValidationError({
        "address.complement": "Complemento muito longo (máx. 60 caracteres)",
      });

    case "INVALID_CITY":
      // Mapped to address.cep (field where the user interacts via CEP lookup).
      // Friendly message lists the serviced cities per PRD F2.4.
      return new ValidationError({
        "address.cep":
          "No momento atendemos apenas Camboriú, Balneário Camboriú, Itapema e Itajaí.",
      });

    case "INVALID_STATE":
      return new ValidationError({ "address.state": "UF inválida" });

    case "EMAIL_ALREADY_REGISTERED":
      return new ValidationError({ email: "E-mail já cadastrado" });

    case "CPF_EMAIL_MISMATCH":
      return new ValidationError({ cpf: "CPF já cadastrado com outro e-mail" });

    case "DUPLICATE_CLIENT":
      return new ValidationError({ _form: "Já existe um cadastro com esses dados." });

    case "RATE_LIMIT_EXCEEDED":
      return new ValidationError({
        _form: "Muitas tentativas. Aguarde um instante e tente novamente.",
      });

    case "INVALID_INPUT":
      return new ValidationError({ _form: "Verifique os dados informados." });

    default:
      // Unknown code — warn for future detection; never log PII.
      console.warn("[mapClientApiError] unmapped error code:", code);
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
    // toApiPayload internally calls ClientEntity.validate so we get normalised data.
    const payload = toApiPayload(input);

    // 2. Call API
    let res: Response;
    try {
      res = await fetch(getApiUrl("/v1/register/client"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
