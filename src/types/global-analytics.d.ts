/**
 * Global type augmentations for analytics primitives injected by third-party
 * scripts (Google Consent Mode v2 / GA4 and Meta Pixel).
 *
 * These globals only exist after the respective `next/script` tags have
 * loaded; consumers must always check `typeof window.gtag === 'function'`
 * (or equivalent) before calling them.
 */

export {};

declare global {
  /**
   * Google Tag Manager / GA4 dataLayer queue.
   * Initialized inline by `consent-mode-init.tsx` before any other script runs.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type DataLayerEntry = unknown[] | Record<string, unknown> | IArguments | any;

  interface ConsentSignals {
    analytics_storage?: 'granted' | 'denied';
    ad_storage?: 'granted' | 'denied';
    ad_user_data?: 'granted' | 'denied';
    ad_personalization?: 'granted' | 'denied';
    wait_for_update?: number;
  }

  interface GtagFn {
    (command: 'consent', action: 'default' | 'update', signals: ConsentSignals): void;
    (command: 'event', eventName: string, params?: Record<string, unknown>): void;
    (command: 'config', targetId: string, params?: Record<string, unknown>): void;
    (command: 'set', params: Record<string, unknown>): void;
    (command: 'js', date: Date): void;
    // Fallback signature — the real `gtag` is variadic.
    (...args: unknown[]): void;
  }

  interface FbqFn {
    (command: 'init', pixelId: string): void;
    (command: 'consent', action: 'grant' | 'revoke'): void;
    (command: 'track', eventName: string, params?: Record<string, unknown>): void;
    (command: 'trackCustom', eventName: string, params?: Record<string, unknown>): void;
    (...args: unknown[]): void;
  }

  interface Window {
    dataLayer?: DataLayerEntry[];
    gtag?: GtagFn;
    fbq?: FbqFn;
  }
}
