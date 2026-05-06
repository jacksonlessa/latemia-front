/**
 * Google Consent Mode v2 default — "denied" for all four ad/analytics
 * signals. Must run BEFORE GA4/Meta Pixel scripts so they queue events with
 * the correct default consent state until the visitor decides.
 *
 * `next/script strategy="beforeInteractive"` injects this synchronously in
 * the `<head>` during the static render, ahead of any `afterInteractive`
 * tag. `wait_for_update: 500` gives the visitor 500 ms to interact before
 * GA4 sends its first hit, reducing wasted denied-pings.
 *
 * The inline body also creates the `dataLayer` queue and the `gtag` shim so
 * subsequent calls (`gtag('consent', 'update', ...)` from the consent
 * provider) work even if the GA4 script hasn't loaded yet.
 */

import Script from 'next/script';

const CONSENT_DEFAULT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
window.gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
`.trim();

export function ConsentModeInit(): React.ReactElement {
  return (
    <Script
      id="consent-mode-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }}
    />
  );
}

/**
 * Exposed for tests so they can assert on the exact body without scraping
 * the rendered DOM.
 */
export const __CONSENT_DEFAULT_SCRIPT_FOR_TESTS = CONSENT_DEFAULT_SCRIPT;
