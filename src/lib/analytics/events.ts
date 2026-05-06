/**
 * Single front-door for analytics event dispatch. Mirrors a single event to
 * GA4 (`gtag('event', ...)`) and Meta Pixel (`fbq('trackCustom', ...)`).
 *
 * No-op when:
 *   - running on the server (SSR / RSC) — `typeof window === 'undefined'`
 *   - the third-party script hasn't loaded yet (e.g. consent denied → script
 *     not injected, or adblocker)
 *
 * Consent gating is performed implicitly: when consent is denied,
 * `consent-mode-init.tsx` keeps `gtag` queued in `dataLayer` with denied
 * defaults, and `fbq('consent', 'revoke')` keeps the pixel queue muted until
 * the visitor opts in. Either way, this helper is safe to call from any UI
 * handler.
 *
 * LGPD: do NOT pass personally identifiable data in `params`. Use opaque
 * IDs and aggregated values (CPF, e-mail, telefone are forbidden).
 */

/**
 * Canonical event names used across the public funnel. Centralizing them
 * here avoids drift between callers (e.g. `step-sucesso` and `analytics`
 * dashboards) and makes it trivial to rename a single event.
 */
export const Events = {
  PageView: 'page_view',
  PageviewLanding: 'pageview_landing',
  BeginCheckout: 'begin_checkout',
  RegisterContractCompleted: 'register_contract_completed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

export function track(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch {
      // Swallow — analytics is best-effort.
    }
  }

  if (typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, params);
    } catch {
      // Swallow — analytics is best-effort.
    }
  }
}
