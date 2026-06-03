/**
 * Single front-door for analytics event dispatch. Mirrors events to GA4
 * (`gtag('event', ...)`) and Meta Pixel (`fbq('trackCustom', ...)`).
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

import posthog from 'posthog-js';

/**
 * Canonical event names used across the public funnel. Centralizing them
 * here avoids drift between callers (e.g. `step-sucesso` and `analytics`
 * dashboards) and makes it trivial to rename a single event.
 */
/** Fired by `MetaPixel` when the inline stub has run and `window.fbq` exists. */
export const FBQ_READY_EVENT = 'lm:fbq-ready';

export const Events = {
  PageView: 'page_view',
  PageviewLanding: 'pageview_landing',
  BeginCheckout: 'begin_checkout',
  CompletedTutor: 'completed_tutor',
  AddedPet: 'added_pet',
  EditedPet: 'edited_pet',
  RemovedPet: 'removed_pet',
  CompletedPet: 'completed_pet',
  ConsentedContract: 'consented_contract',
  SolicitedOtp: 'solicited_otp',
  OtpSendError: 'otp_send_error',
  OtpValidationError: 'otp_validation_error',
  ResolicitedOtp: 'resolicited_otp',
  FinishedOtp: 'finished_otp',
  CompletedContract: 'completed_contract',
  CompletedPayment: 'completed_payment',
  RegisterContractCompleted: 'register_contract_completed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

const DEFAULT_DEDUPE_WINDOW_MS = 2500;
const recentEventEmission = new Map<string, number>();

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

  try {
    posthog.capture(eventName, params);
  } catch {
    // Swallow — analytics is best-effort.
  }
}

/**
 * Emits an event unless the same key has been emitted in a short cooldown
 * window. Useful for guarding against dev-only double effects/handlers.
 */
export function trackWithCooldown(
  key: string,
  eventName: string,
  params?: Record<string, unknown>,
  cooldownMs: number = DEFAULT_DEDUPE_WINDOW_MS,
): void {
  const now = Date.now();
  const lastEmissionAt = recentEventEmission.get(key);
  if (lastEmissionAt !== undefined && now - lastEmissionAt < cooldownMs) {
    return;
  }
  recentEventEmission.set(key, now);
  track(eventName, params);
}
