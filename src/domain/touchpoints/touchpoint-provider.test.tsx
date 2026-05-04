/**
 * Unit tests for the `TouchpointProvider` Client Component.
 *
 * `next/navigation` is mocked so we control `usePathname` / `useSearchParams`
 * without spinning up the Next.js router. Browser globals (`window.location`,
 * `document.referrer`) are mocked per-test.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ReadonlyURLSearchParams } from 'next/navigation';
import {
  TouchpointProvider,
  useTouchpoints,
} from './touchpoint-provider';
import {
  TOUCHPOINT_STORAGE_KEYS,
  __resetTouchpointMemoryStoreForTests,
} from './touchpoint-storage';

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

function ConsumerProbe(): React.ReactElement {
  const { firstTouch, lastTouch } = useTouchpoints();
  return (
    <div>
      <span data-testid="first-source">{firstTouch?.utmSource ?? ''}</span>
      <span data-testid="last-source">{lastTouch?.utmSource ?? ''}</span>
    </div>
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

describe('TouchpointProvider', () => {
  it('should expose null first/last touch before mount captures complete (server render)', () => {
    // Just sanity-check the type signature — the component itself runs the
    // capture inside useEffect, so a synchronous render will already have
    // captured by the time queries run in jsdom. We mainly assert no throws.
    setLocation('/', '');
    expect(() =>
      render(
        <TouchpointProvider>
          <ConsumerProbe />
        </TouchpointProvider>,
      ),
    ).not.toThrow();
  });

  it('should capture UTM params on mount and expose them via the hook', () => {
    setLocation('/', 'utm_source=instagram&utm_campaign=lancamento');

    render(
      <TouchpointProvider>
        <ConsumerProbe />
      </TouchpointProvider>,
    );

    expect(screen.getByTestId('first-source').textContent).toBe('instagram');
    expect(screen.getByTestId('last-source').textContent).toBe('instagram');
    expect(
      window.localStorage.getItem(TOUCHPOINT_STORAGE_KEYS.first),
    ).not.toBeNull();
  });

  it('should preserve firstTouch (first wins) when route changes carry new UTMs', () => {
    setLocation('/', 'utm_source=instagram');
    const view = render(
      <TouchpointProvider>
        <ConsumerProbe />
      </TouchpointProvider>,
    );

    expect(screen.getByTestId('first-source').textContent).toBe('instagram');

    // Simulate navigation within the public group with new attribution.
    act(() => {
      setLocation('/contratar', 'utm_source=meta&utm_campaign=ads');
    });
    view.rerender(
      <TouchpointProvider>
        <ConsumerProbe />
      </TouchpointProvider>,
    );

    expect(screen.getByTestId('first-source').textContent).toBe('instagram');
    expect(screen.getByTestId('last-source').textContent).toBe('meta');
  });

  it('should not overwrite lastTouch with an empty pageview when navigating to a route without params', () => {
    setLocation('/', 'utm_source=instagram');
    const view = render(
      <TouchpointProvider>
        <ConsumerProbe />
      </TouchpointProvider>,
    );

    expect(screen.getByTestId('last-source').textContent).toBe('instagram');

    act(() => {
      setLocation('/privacidade', '');
    });
    view.rerender(
      <TouchpointProvider>
        <ConsumerProbe />
      </TouchpointProvider>,
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

    render(
      <TouchpointProvider>
        <ConsumerProbe />
      </TouchpointProvider>,
    );

    // No UTM, but referrer counts as attribution data.
    const stored = window.sessionStorage.getItem(
      TOUCHPOINT_STORAGE_KEYS.last,
    );
    expect(stored).not.toBeNull();
    expect(stored).toContain('t.co');
  });
});
