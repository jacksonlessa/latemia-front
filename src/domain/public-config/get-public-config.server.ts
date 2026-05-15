/**
 * Server-side companion of `getPublicConfig` — invoked from React Server
 * Components (landing pages, etc.) where we want Next's request-time
 * caching with ISR rather than the `cache: 'no-store'` semantics used by
 * the client-side mount fetch in `/contratar`.
 *
 * Same fail-safe contract: any error path resolves to the default config.
 * The fetch is configured with `next.revalidate = 60` so the landing
 * survives a brief backend outage at request-time but still reflects
 * admin price changes within at most one minute.
 *
 * LGPD: este endpoint não recebe nem retorna PII. Logs emitidos em caso de
 * falha são genéricos e nunca incluem URL completa, payload ou stack-trace.
 */
import { getApiUrl } from '@/lib/api-client';
import {
  type PublicConfig,
  FALLBACK_PRICE_PER_PET_CENTS,
} from './get-public-config.use-case';

const DEFAULT_CONFIG: PublicConfig = {
  otpContractEnabled: false,
  pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS,
};

/** ISR revalidation window (seconds) for the public-config fetch from RSC. */
const REVALIDATE_SECONDS = 60;

export async function getPublicConfigSSR(): Promise<PublicConfig> {
  try {
    const res = await fetch(getApiUrl('/v1/public-config'), {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      console.warn('Failed to fetch public config (SSR), defaulting');
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
    console.warn('Failed to fetch public config (SSR), defaulting');
    return DEFAULT_CONFIG;
  }
}
