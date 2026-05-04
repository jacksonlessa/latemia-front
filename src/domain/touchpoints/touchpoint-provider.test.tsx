/**
 * Unit tests for the `TouchpointProvider` Client Component.
 *
 * `next/navigation` is mocked so we control `usePathname` / `useSearchParams`
 * without spinning up the Next.js router. Browser globals (`window.location`,
 * `document.referrer`) are mocked per-test.
 *
 * Tests cover both consent paths:
 *   - marketing GRANTED → values flow into localStorage / sessionStorage
 *   - marketing DENIED  → values stay in memory only (PRD §1.7 LGPD)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  TouchpointProvider,
  useTouchpoints,
} from './touchpoint-provider';
import {
  TOUCHPOINT_STORAGE_KEYS,
  __resetTouchpointMemoryStoreForTests,
} from './touchpoint-storage';
import {
  ConsentProvider,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from '@/components/public/consent/consent-provider';

const navigationState = {
  pathname: '/',
  search: '',
};

vi.mock('next/navigation', async () => {
  const actual =
    await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    usePathname: (): string => navigationState.pathname,
    useSearchParams: (): URLSearchParams =>
      new URLSearchParams(navigationState.search),
    ReadonlyURLSearchParams: actual.ReadonlyURLSearchParams,
  };
});

function setLocation(pathname: string, search: string): void {
  navigationState.pathname = pathname;
  navigationState.search = search;
  // Mirror into window.location so the provider's `window.location.search`
  // read agrees with the mocked router state.
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, pathname, search: search ? `?${search}` : '' },
    writable: true,
  });
}

function seedMarketingConsent(granted: boolean): void {
  // Pre-populate localStorage so ConsentProvider hydrates with the desired
  // consent state on mount, avoiding the "needs decision" branch.
  window.localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      analytics: granted ? 'granted' : 'denied',
      marketing: granted ? 'granted' : 'denied',
      version: CONSENT_VERSION,
      decidedAt: '2026-05-04T00:00:00.000Z',
    }),
  );
}

function ConsumerProbe(): React.ReactElement {
  const { firstTouch, lastTouch } = useTouchpoints();
  return (
    <div>
      <span data-testid="first-source">{firstTouch?.utmSource ?? ''}</span>
      <span data-testid="last-source">{lastTouch?.utmSource ?? ''}</span>
    </div>
  );
}

function renderWithConsent(
  granted: boolean,
  ui: React.ReactElement,
): ReturnType<typeof render> {
  seedMarketingConsent(granted);
  return render(
    <ConsentProvider>
      <TouchpointProvider>{ui}</TouchpointProvider>
    </ConsentProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  __resetTouchpointMemoryStoreForTests();
  navigationState.pathname = '/';
  navigationState.search = '';
  Object.defineProperty(document, 'referrer', {
    configurable: true,
    value: '',
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TouchpointProvider — marketing consent granted', () => {
  it('should not throw on initial render', () => {
    setLocation('/', '');
    expect(() => renderWithConsent(true, <ConsumerProbe />)).not.toThrow();
  });

  it('should capture UTM params on mount and expose them via the hook', () => {
    setLocation('/', 'utm_source=instagram&utm_campaign=lancamento');

    renderWithConsent(true, <ConsumerProbe />);

    expect(screen.getByTestId('first-source').textContent).toBe('instagram');
    expect(screen.getByTestId('last-source').textContent).toBe('instagram');
    expect(
      window.localStorage.getItem(TOUCHPOINT_STORAGE_KEYS.first),
    ).not.toBeNull();
  });

  it('should preserve firstTouch (first wins) when route changes carry new UTMs', () => {
    setLocation('/', 'utm_source=instagram');
    seedMarketingConsent(true);
    const view = render(
      <ConsentProvider>
        <TouchpointProvider>
          <ConsumerProbe />
        </TouchpointProvider>
      </ConsentProvider>,
    );

    expect(screen.getByTestId('first-source').textContent).toBe('instagram');

    // Simulate navigation within the public group with new attribution.
    act(() => {
      setLocation('/contratar', 'utm_source=meta&utm_campaign=ads');
    });
    view.rerender(
      <ConsentProvider>
        <TouchpointProvider>
          <ConsumerProbe />
        </TouchpointProvider>
      </ConsentProvider>,
    );

    expect(screen.getByTestId('first-source').textContent).toBe('instagram');
    expect(screen.getByTestId('last-source').textContent).toBe('meta');
  });

  it('should not overwrite lastTouch with an empty pageview when navigating to a route without params', () => {
    setLocation('/', 'utm_source=instagram');
    seedMarketingConsent(true);
    const view = render(
      <ConsentProvider>
        <TouchpointProvider>
          <ConsumerProbe />
        </TouchpointProvider>
      </ConsentProvider>,
    );

    expect(screen.getByTestId('last-source').textContent).toBe('instagram');

    act(() => {
      setLocation('/privacidade', '');
    });
    view.rerender(
      <ConsentProvider>
        <TouchpointProvider>
          <ConsumerProbe />
        </TouchpointProvider>
      </ConsentProvider>,
    );

    // last-touch retains the previous attribution.
    expect(screen.getByTestId('last-source').textContent).toBe('instagram');
  });

  it('should expose null state when used outside the provider', () => {
    function Solo(): React.ReactElement {
      const { firstTouch, lastTouch } = useTouchpoints();
      return (
        <span data-testid="solo">
          {firstTouch === null && lastTouch === null ? 'empty' : 'set'}
        </span>
      );
    }
    render(<Solo />);
    expect(screen.getByTestId('solo').textContent).toBe('empty');
  });
});

describe('TouchpointProvider — referrer', () => {
  it('should read document.referrer at capture time without parameters in URL', () => {
    setLocation('/', '');
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://t.co/abc',
    });

    renderWithConsent(true, <ConsumerProbe />);

    // No UTM, but referrer counts as attribution data.
    const stored = window.sessionStorage.getItem(
      TOUCHPOINT_STORAGE_KEYS.last,
    );
    expect(stored).not.toBeNull();
    expect(stored).toContain('t.co');
  });
});

describe('TouchpointProvider — marketing consent denied (PRD §1.7)', () => {
  it('should expose touchpoints in memory without persisting to localStorage/sessionStorage', () => {
    setLocation('/', 'utm_source=instagram&utm_campaign=lancamento');

    renderWithConsent(false, <ConsumerProbe />);

    // Touchpoint is still available to the in-memory consumer (the converted
    // client can still post attribution).
    expect(screen.getByTestId('first-source').textContent).toBe('instagram');
    expect(screen.getByTestId('last-source').textContent).toBe('instagram');

    // But NEITHER storage was written to.
    expect(
      window.localStorage.getItem(TOUCHPOINT_STORAGE_KEYS.first),
    ).toBeNull();
    expect(
      window.sessionStorage.getItem(TOUCHPOINT_STORAGE_KEYS.last),
    ).toBeNull();
  });

  it('should preserve in-memory firstTouch when navigating with new params', () => {
    setLocation('/', 'utm_source=instagram');
    seedMarketingConsent(false);
    const view = render(
      <ConsentProvider>
        <TouchpointProvider>
          <ConsumerProbe />
        </TouchpointProvider>
      </ConsentProvider>,
    );

    expect(screen.getByTestId('first-source').textContent).toBe('instagram');

    act(() => {
      setLocation('/contratar', 'utm_source=meta');
    });
    view.rerender(
      <ConsentProvider>
        <TouchpointProvider>
          <ConsumerProbe />
        </TouchpointProvider>
      </ConsentProvider>,
    );

    // First-wins still holds in memory, last reflects the new attribution.
    expect(screen.getByTestId('first-source').textContent).toBe('instagram');
    expect(screen.getByTestId('last-source').textContent).toBe('meta');
    // And no storage was written.
    expect(
      window.localStorage.getItem(TOUCHPOINT_STORAGE_KEYS.first),
    ).toBeNull();
    expect(
      window.sessionStorage.getItem(TOUCHPOINT_STORAGE_KEYS.last),
    ).toBeNull();
  });
});
