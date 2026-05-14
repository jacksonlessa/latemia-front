/**
 * GetPublicConfigUseCase — fetches the public-config flags from the backend
 * and returns a typed, normalised object for the frontend to consume.
 *
 * Endpoint: `GET /v1/public-config` (public, no auth).
 * Body shape from backend:
 *   `{ otp_contract_enabled: boolean, subscription_plan_price_cents: number | null }`
 *
 * Fail-safe contract: ANY error path — network failure, timeout (`AbortError`),
 * non-OK HTTP status, or malformed JSON — resolves to a defaults payload
 * (`otpContractEnabled: false`, `pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS`).
 * The use-case never rejects. This keeps the `/contratar` funnel and the
 * public landing usable when the backend is unreachable or the settings
 * haven't been provisioned yet.
 *
 * LGPD: este endpoint não recebe nem retorna PII. Logs emitidos em caso de
 * falha são genéricos e nunca incluem URL completa, payload ou stack-trace.
 */
import { getApiUrl } from '@/lib/api-client';

/**
 * Static fallback used when the backend is unreachable or has not been
 * provisioned with `subscription_plan_price_cents`. Mirrors the historical
 * launch price (R$ 25,00/pet). Keep this in sync with the production
 * setting; treat any divergence as a bug to be corrected in the DB.
 */
export const FALLBACK_PRICE_PER_PET_CENTS = 2500;

/** Public configuration consumed by the public funnel and landing. */
export interface PublicConfig {
  /**
   * When `true`, the contract acceptance step must require an OTP verification
   * flow before allowing the user to advance to payment. When `false`, the
   * legacy flow (checkbox-only) applies.
   */
  otpContractEnabled: boolean;
  /**
   * Per-pet monthly subscription price in cents (e.g. `2500` = R$ 25,00).
   *
   * Source of truth: backend `SystemSetting.subscription_plan_price_cents`,
   * the very same value the checkout orchestrator uses to build the Pagar.me
   * subscription item. When the backend is unreachable or hasn't been
   * provisioned, this defaults to `FALLBACK_PRICE_PER_PET_CENTS`.
   */
  pricePerPetCents: number;
}

/** Fail-safe default returned when the backend is unreachable or errors out. */
const DEFAULT_CONFIG: PublicConfig = {
  otpContractEnabled: false,
  pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS,
};

/** Hard timeout (ms) for the public-config fetch — small enough to avoid blocking the UI. */
const FETCH_TIMEOUT_MS = 3000;

/**
 * Returns the public configuration exposed by the backend.
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
      console.warn('Failed to fetch public config, defaulting to disabled');
      return DEFAULT_CONFIG;
    }

    const body = (await res.json()) as {
      otp_contract_enabled?: boolean;
      subscription_plan_price_cents?: number | null;
    };

    const price = body.subscription_plan_price_cents;
    const pricePerPetCents =
      typeof price === 'number' && Number.isInteger(price) && price > 0
        ? price
        : FALLBACK_PRICE_PER_PET_CENTS;

    return {
      otpContractEnabled: body.otp_contract_enabled === true,
      pricePerPetCents,
    };
  } catch {
    console.warn('Failed to fetch public config, defaulting to disabled');
    return DEFAULT_CONFIG;
  } finally {
    clearTimeout(timeoutId);
  }
}
