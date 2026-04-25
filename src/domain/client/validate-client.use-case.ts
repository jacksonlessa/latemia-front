/**
 * validateClientUseCase
 *
 * Calls the dry-run endpoint POST /v1/checkout/validate-client to validate
 * client data without persisting anything. Returns void on success.
 *
 * Reuses `mapClientApiError` and `toApiPayload` from register-client.use-case
 * to guarantee symmetric error handling and serialisation between the dry-run
 * and the actual registration call.
 *
 * LGPD: no personal data is included in thrown errors or logs.
 */

import { ValidationError } from "@/lib/validation-error";
import { getApiUrl } from "@/lib/api-client";
import type { RegisterClientInput } from "@/lib/types/client";
import { mapClientApiError, toApiPayload } from "./register-client.use-case";

/**
 * Validates client input via the backend dry-run endpoint.
 *
 * - Returns `void` when the server responds with HTTP 200.
 * - Throws `ValidationError` with per-field errors on HTTP 4xx/5xx.
 * - Throws `ValidationError` with `_form` error on network failure.
 *
 * @param input - Raw registration form data (same shape as RegisterClientInput).
 */
export async function validateClientUseCase(
  input: RegisterClientInput,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(getApiUrl("/v1/checkout/validate-client"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toApiPayload(input)),
    });
  } catch {
    // Network failure — no personal data in error message
    throw new ValidationError({
      _form: "Não foi possível validar seus dados. Verifique sua conexão.",
    });
  }

  if (!res.ok) {
    throw await mapClientApiError(res);
  }
}
