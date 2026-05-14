import type { Metadata } from 'next';
import { ConsentProvider } from '@/components/public/consent/consent-provider';
import { ConsentModeInit } from '@/components/public/consent/consent-mode-init';
import { CookieBanner } from '@/components/public/consent/cookie-banner';
import {
  GA4,
  MetaPixel,
  RouteChangeTracker,
} from '@/components/public/analytics';
import { TouchpointProvider } from '@/domain/touchpoints/touchpoint-provider';

export const metadata: Metadata = {
  title: 'Plano de Emergência Veterinária — Late & Mia',
  description:
    'Tenha 50% de desconto em emergências veterinárias na Late & Mia (Camboriú), após carência de 180 dias. Plano simples, transparente e sem surpresas.',
  applicationName: 'Late & Mia',
};

/**
 * Public route group layout — wraps every visitor-facing page in the LGPD
 * consent stack and analytics primitives.
 *
 * Provider order matters:
 *   1. `ConsentProvider` (state + persistence + gtag/fbq sync)
 *   2. `TouchpointProvider` (reads consent to decide whether to persist)
 *   3. `ConsentModeInit` — must run BEFORE GA4/Meta scripts so the default
 *      "denied" signals are queued in `dataLayer`
 *   4. `GA4` / `MetaPixel` — load conditionally based on env vars; consent
 *      gating is delegated to Consent Mode v2
 *   5. `RouteChangeTracker` — emits `page_view` on App Router transitions
 *   6. children (per-segment layouts: site, contratar, atualizar-pagamento)
 *   7. `CookieBanner` — fixed bottom; visibility is driven by the provider
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsentProvider>
      <TouchpointProvider>
        <ConsentModeInit />
        <GA4 />
        <MetaPixel />
        <RouteChangeTracker />
        <div className="bg-cream min-h-screen">{children}</div>
        <CookieBanner />
      </TouchpointProvider>
    </ConsentProvider>
  );
}
