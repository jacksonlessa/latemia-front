'use client';

/**
 * Client-side provider that captures touchpoints on mount and on route changes
 * within the public route group. Exposes the current `firstTouch`/`lastTouch`
 * via the `useTouchpoints()` hook.
 *
 * SSR-safe: window/document access lives strictly inside `useEffect`. The
 * server render returns the provider with empty state.
 *
 * The internal capture node uses `useSearchParams`, which forces the CSR
 * bailout warning if not wrapped in a Suspense boundary. We wrap it ourselves
 * here so consumers (the public layout) don't need to know about it — the
 * outer provider stays static-friendly.
 */

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  captureTouchpointFromUrl,
  hasAttributionData,
} from './capture-touchpoints.use-case';
import {
  getFirstTouch,
  getLastTouch,
  setFirstTouch,
  setLastTouch,
} from './touchpoint-storage';
import type {
  Touchpoint,
  TouchpointContextValue,
} from './touchpoints.types';
import { useConsent } from '@/components/public/consent/consent-provider';

const TouchpointContext = createContext<TouchpointContextValue | null>(null);

export interface TouchpointProviderProps {
  children: ReactNode;
}

export function TouchpointProvider({
  children,
}: TouchpointProviderProps): React.ReactElement {
  const [firstTouch, setFirstTouchState] = useState<Touchpoint | null>(null);
  const [lastTouch, setLastTouchState] = useState<Touchpoint | null>(null);
  const { state: consentState } = useConsent();
  const marketingGranted = consentState.marketing === 'granted';

  const value = useMemo<TouchpointContextValue>(
    () => ({ firstTouch, lastTouch }),
    [firstTouch, lastTouch],
  );

  return (
    <TouchpointContext.Provider value={value}>
      <Suspense fallback={null}>
        <TouchpointCaptureEffect
          onFirstTouchChange={setFirstTouchState}
          onLastTouchChange={setLastTouchState}
          marketingGranted={marketingGranted}
        />
      </Suspense>
      {children}
    </TouchpointContext.Provider>
  );
}

interface TouchpointCaptureEffectProps {
  onFirstTouchChange: (value: Touchpoint | null) => void;
  onLastTouchChange: (value: Touchpoint | null) => void;
  /**
   * When `false`, the capture stays in memory only — no `localStorage` /
   * `sessionStorage` writes. PRD §1.7 (LGPD): UTMs are read from URL always,
   * but cross-session persistence requires marketing consent.
   */
  marketingGranted: boolean;
}

/**
 * Internal node responsible for the capture side-effect. Lives inside a
 * Suspense boundary because `useSearchParams` requires it (App Router
 * static rendering bail-out rule, Next.js 15).
 */
function TouchpointCaptureEffect({
  onFirstTouchChange,
  onLastTouchChange,
  marketingGranted,
}: TouchpointCaptureEffectProps): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSignatureRef = useRef<string | null>(null);
  // In-memory holders for the no-consent path. We keep both touchpoints so
  // a converted client still posts attribution data without ever writing to
  // browser storage.
  const memoryFirstRef = useRef<Touchpoint | null>(null);
  const memoryLastRef = useRef<Touchpoint | null>(null);

  const capture = useCallback((): void => {
    if (typeof window === 'undefined') return;

    const search = window.location.search;
    const referrer =
      typeof document !== 'undefined' ? document.referrer : '';
    const touchpoint = captureTouchpointFromUrl(search, referrer, new Date());

    if (marketingGranted) {
      // Cross-session persistence path (storage-backed).
      const storedFirst = getFirstTouch();
      if (storedFirst !== null) {
        onFirstTouchChange(storedFirst);
      } else {
        setFirstTouch(touchpoint);
        onFirstTouchChange(touchpoint);
      }

      if (hasAttributionData(touchpoint)) {
        setLastTouch(touchpoint);
        onLastTouchChange(touchpoint);
      } else {
        const storedLast = getLastTouch();
        if (storedLast !== null) {
          onLastTouchChange(storedLast);
        } else {
          setLastTouch(touchpoint);
          onLastTouchChange(touchpoint);
        }
      }
      return;
    }

    // No marketing consent → in-memory only (PRD §1.7).
    if (memoryFirstRef.current === null) {
      memoryFirstRef.current = touchpoint;
    }
    onFirstTouchChange(memoryFirstRef.current);

    if (hasAttributionData(touchpoint)) {
      memoryLastRef.current = touchpoint;
      onLastTouchChange(touchpoint);
    } else if (memoryLastRef.current !== null) {
      onLastTouchChange(memoryLastRef.current);
    } else {
      memoryLastRef.current = touchpoint;
      onLastTouchChange(touchpoint);
    }
  }, [onFirstTouchChange, onLastTouchChange, marketingGranted]);

  useEffect(() => {
    const search = searchParams !== null ? searchParams.toString() : '';
    // Include `marketingGranted` in the signature so a consent change after
    // the initial capture (e.g. ConsentProvider hydrates from localStorage
    // inside its own useEffect) re-runs the capture and follows the right
    // persistence path.
    const signature = `${marketingGranted ? '1' : '0'}|${pathname ?? ''}?${search}`;
    if (lastSignatureRef.current === signature) {
      return;
    }
    lastSignatureRef.current = signature;
    capture();
  }, [pathname, searchParams, capture, marketingGranted]);

  return null;
}

export function useTouchpoints(): TouchpointContextValue {
  const ctx = useContext(TouchpointContext);
  if (ctx === null) {
    // Hook used outside the provider tree → return empty state instead of
    // throwing, so callers in non-public routes (or in unit tests) degrade
    // gracefully.
    return { firstTouch: null, lastTouch: null };
  }
  return ctx;
}
