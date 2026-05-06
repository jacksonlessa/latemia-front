'use client';

/**
 * GA4 (Google Analytics 4) loader. Renders nothing when the measurement ID is
 * absent (e.g. local dev without analytics, or a Preview build that should not
 * pollute production property data) — making the component build-safe across
 * environments without runtime guards in callers.
 *
 * The configuration call passes `send_page_view: false` because route changes
 * are tracked manually via `RouteChangeTracker` — relying on GA4's automatic
 * page_view would miss intra-app navigations served by the App Router.
 *
 * Consent gating is delegated to `ConsentModeInit` (default-denied) and
 * `ConsentProvider` (granted/revoked transitions). This component just loads
 * the script; whether GA4 actually sends hits is decided by Consent Mode v2.
 */

import Script from 'next/script';

const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

export function GA4(): React.ReactElement | null {
  if (!GA4_MEASUREMENT_ID) return null;

  const id = GA4_MEASUREMENT_ID;
  // Use a stable inline body so future maintainers can grep for the call.
  const configBody = `window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
window.gtag('js', new Date());
window.gtag('config', '${id}', { send_page_view: false });`;

  return (
    <>
      <Script
        id="ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: configBody }}
      />
    </>
  );
}

/** Exposed for tests so they can detect whether the component will render. */
export const __GA4_MEASUREMENT_ID_FOR_TESTS = GA4_MEASUREMENT_ID;
