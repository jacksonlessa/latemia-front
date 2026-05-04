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

const TouchpointContext = createContext<TouchpointContextValue | null>(null);

export interface TouchpointProviderProps {
  children: ReactNode;
}

export function TouchpointProvider({
  children,
}: TouchpointProviderProps): React.ReactElement {
  const [firstTouch, setFirstTouchState] = useState<Touchpoint | null>(null);
  const [lastTouch, setLastTouchState] = useState<Touchpoint | null>(null);

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
        />
      </Suspense>
      {children}
    </TouchpointContext.Provider>
  );
}

interface TouchpointCaptureEffectProps {
  onFirstTouchChange: (value: Touchpoint | null) => void;
  onLastTouchChange: (value: Touchpoint | null) => void;
}

/**
 * Internal node responsible for the capture side-effect. Lives inside a
 * Suspense boundary because `useSearchParams` requires it (App Router
 * static rendering bail-out rule, Next.js 15).
 */
function TouchpointCaptureEffect({
  onFirstTouchChange,
  onLastTouchChange,
}: TouchpointCaptureEffectProps): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSignatureRef = useRef<string | null>(null);

  const capture = useCallback((): void => {
    if (typeof window === 'undefined') return;

    const search = window.location.search;
    const referrer =
      typeof document !== 'undefined' ? document.referrer : '';
    const touchpoint = captureTouchpointFromUrl(search, referrer, new Date());

    // TODO 5.0: gate by consent.marketing — only persist to localStorage /
    // sessionStorage when marketing consent is granted. For now, persist
    // unconditionally (PRD §1.7 says we always read from URL; storage gating
    // ships with the consent provider in task 5.0).

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
  }, [onFirstTouchChange, onLastTouchChange]);

  useEffect(() => {
    const search = searchParams !== null ? searchParams.toString() : '';
    const signature = `${pathname ?? ''}?${search}`;
    if (lastSignatureRef.current === signature) {
      return;
    }
    lastSignatureRef.current = signature;
    capture();
  }, [pathname, searchParams, capture]);

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
