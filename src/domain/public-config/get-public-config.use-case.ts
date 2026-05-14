/**
 * GetPublicConfigUseCase — fetches the public-config flags from the backend
 * and returns a typed, normalised object for the frontend to consume.
 *
 * Endpoint: `GET /v1/public-config` (public, no auth).
 * Body shape from backend: `{ otp_contract_enabled: boolean }` (snake_case).
 *
 * Fail-safe contract: ANY error path — network failure, timeout (`AbortError`),
 * non-OK HTTP status, or malformed JSON — resolves to
 * `{ otpContractEnabled: false }`. The use-case never rejects. This keeps the
 * `/contratar` funnel destravado quando o backend está indisponível ou a flag
 * ainda não foi provisionada no `SystemSetting`.
 *
 * LGPD: este endpoint não recebe nem retorna PII. Logs emitidos em caso de
 * falha são genéricos e nunca incluem URL completa, payload ou stack-trace.
 */
import { getApiUrl } from '@/lib/api-client';

/** Public configuration flags consumed by the public funnel. */
export interface PublicConfig {
  /**
   * When `true`, the contract acceptance step must require an OTP verification
   * flow before allowing the user to advance to payment. When `false`, the
   * legacy flow (checkbox-only) applies.
   */
  otpContractEnabled: boolean;
}

/** Fail-safe default returned when the backend is unreachable or errors out. */
const DEFAULT_CONFIG: PublicConfig = { otpContractEnabled: false };

/** Hard timeout (ms) for the public-config fetch — small enough to avoid blocking the UI. */
const FETCH_TIMEOUT_MS = 3000;

/**
 * Returns the public configuration flags exposed by the backend.
 *
 * Always resolves — never rejects. Errors are swallowed and logged via
 * `console.warn` with a generic message (no URL, no payload, no PII).
 */
export async function getPublicConfig(): Promise<PublicConfig> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(getApiUrl('/v1/public-config'), {
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(
        'Failed to fetch public config, defaulting to disabled',
      );
      return DEFAULT_CONFIG;
    }

    const body = (await res.json()) as { otp_contract_enabled?: boolean };
    return { otpContractEnabled: body.otp_contract_enabled === true };
  } catch {
    console.warn('Failed to fetch public config, defaulting to disabled');
    return DEFAULT_CONFIG;
  } finally {
    clearTimeout(timeoutId);
  }
}
