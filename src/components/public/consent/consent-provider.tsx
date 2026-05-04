'use client';

/**
 * LGPD Consent Provider — single source of truth for the visitor's choice on
 * non-essential cookie categories (analytics + marketing). Essential cookies
 * are always allowed and not modeled here.
 *
 * Default state is `denied` for both categories (LGPD §opt-in). Persistence
 * lives in `localStorage` under a versioned key — bumping `CONSENT_VERSION`
 * invalidates prior choices and re-prompts the visitor.
 *
 * On every choice, the provider:
 *   1. Updates internal React state.
 *   2. Persists to `localStorage` (best-effort; silently no-ops in private mode).
 *   3. Calls `gtag('consent', 'update', ...)` for Google Consent Mode v2 with
 *      the four ad/analytics signals required by Google.
 *   4. Calls `fbq('consent', 'grant'|'revoke')` if the Meta Pixel is loaded.
 *   5. Dispatches a `lm:consent-changed` `CustomEvent` on `window` so other
 *      parts of the app (e.g. the touchpoint provider) can react without
 *      re-rendering through Context.
 *
 * SSR: the initial render returns `denied/denied/decidedAt:null` to avoid
 * hydration mismatches; `localStorage` is read once on mount.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ConsentSignal = 'granted' | 'denied';

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = 'lm_consent_v1';
export const CONSENT_CHANGED_EVENT = 'lm:consent-changed';

export interface ConsentState {
  analytics: ConsentSignal;
  marketing: ConsentSignal;
  version: number;
  /** ISO-8601 string when the visitor made a choice; `null` before any choice. */
  decidedAt: string | null;
}

export interface ConsentPartialUpdate {
  analytics?: ConsentSignal;
  marketing?: ConsentSignal;
}

export interface ConsentContextValue {
  state: ConsentState;
  /** True when the visitor has not made any choice yet (banner visible). */
  needsDecision: boolean;
  /** True while the "Personalizar" modal is open. */
  preferencesOpen: boolean;
  accept: () => void;
  reject: () => void;
  update: (partial: ConsentPartialUpdate) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const DEFAULT_STATE: ConsentState = {
  analytics: 'denied',
  marketing: 'denied',
  version: CONSENT_VERSION,
  decidedAt: null,
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function safeReadStoredState(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') return null;
    const candidate = parsed as Partial<ConsentState>;
    if (
      typeof candidate.version !== 'number' ||
      candidate.version !== CONSENT_VERSION
    ) {
      // Version mismatch → re-prompt visitor.
      return null;
    }
    if (
      candidate.analytics !== 'granted' &&
      candidate.analytics !== 'denied'
    ) {
      return null;
    }
    if (candidate.marketing !== 'granted' && candidate.marketing !== 'denied') {
      return null;
    }
    if (
      candidate.decidedAt !== null &&
      typeof candidate.decidedAt !== 'string'
    ) {
      return null;
    }
    return {
      analytics: candidate.analytics,
      marketing: candidate.marketing,
      version: CONSENT_VERSION,
      decidedAt: candidate.decidedAt ?? null,
    };
  } catch {
    return null;
  }
}

function safeWriteStoredState(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / disabled storage — choice is honored in memory only.
    console.warn('[consent] storage write failed; choice held in memory only');
  }
}

function syncToGtag(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: state.analytics,
    ad_storage: state.marketing,
    ad_user_data: state.marketing,
    ad_personalization: state.marketing,
  });
}

function syncToFbq(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  window.fbq('consent', state.marketing === 'granted' ? 'grant' : 'revoke');
}

function dispatchConsentChanged(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent<ConsentState>(CONSENT_CHANGED_EVENT, { detail: state }),
    );
  } catch {
    // CustomEvent unsupported (extremely old browser). No-op.
  }
}

export interface ConsentProviderProps {
  children: ReactNode;
}

export function ConsentProvider({
  children,
}: ConsentProviderProps): React.ReactElement {
  const [state, setState] = useState<ConsentState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [preferencesOpen, setPreferencesOpen] = useState<boolean>(false);

  // Hydrate from localStorage once on mount. Hydration mismatch is avoided
  // because the banner uses `needsDecision` which depends on `decidedAt`,
  // and we render the banner only after `hydrated === true` (see CookieBanner).
  useEffect(() => {
    const stored = safeReadStoredState();
    if (stored !== null) {
      setState(stored);
      // On hydration, also re-sync the consent signals to gtag/fbq in case
      // the scripts loaded between the SSR default-denied call and now.
      syncToGtag(stored);
      syncToFbq(stored);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: ConsentState): void => {
    setState(next);
    safeWriteStoredState(next);
    syncToGtag(next);
    syncToFbq(next);
    dispatchConsentChanged(next);
  }, []);

  const accept = useCallback((): void => {
    persist({
      analytics: 'granted',
      marketing: 'granted',
      version: CONSENT_VERSION,
      decidedAt: new Date().toISOString(),
    });
    setPreferencesOpen(false);
  }, [persist]);

  const reject = useCallback((): void => {
    persist({
      analytics: 'denied',
      marketing: 'denied',
      version: CONSENT_VERSION,
      decidedAt: new Date().toISOString(),
    });
    setPreferencesOpen(false);
  }, [persist]);

  const update = useCallback(
    (partial: ConsentPartialUpdate): void => {
      persist({
        analytics: partial.analytics ?? state.analytics,
        marketing: partial.marketing ?? state.marketing,
        version: CONSENT_VERSION,
        decidedAt: new Date().toISOString(),
      });
      setPreferencesOpen(false);
    },
    [persist, state.analytics, state.marketing],
  );

  const openPreferences = useCallback((): void => {
    setPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback((): void => {
    setPreferencesOpen(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      state,
      // Banner only shows after hydration AND when the visitor hasn't decided.
      // Pre-hydration we report `needsDecision: false` so SSR matches CSR.
      needsDecision: hydrated && state.decidedAt === null,
      preferencesOpen,
      accept,
      reject,
      update,
      openPreferences,
      closePreferences,
    }),
    [
      state,
      hydrated,
      preferencesOpen,
      accept,
      reject,
      update,
      openPreferences,
      closePreferences,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (ctx === null) {
    // Hook used outside the provider tree (e.g. admin pages or unit tests
    // that don't wrap with the provider) → return a denied/no-op default
    // so callers can still call `consent.state.marketing === 'granted'`
    // without guard rails.
    return {
      state: DEFAULT_STATE,
      needsDecision: false,
      preferencesOpen: false,
      accept: () => {},
      reject: () => {},
      update: () => {},
      openPreferences: () => {},
      closePreferences: () => {},
    };
  }
  return ctx;
}
