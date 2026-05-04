/**
 * Unit tests for `RouteChangeTracker`.
 *
 * Strategy: mock `next/navigation` (`usePathname` + `useSearchParams`) and the
 * `track()` helper so we can assert the exact event payloads emitted on each
 * navigation. The component itself wraps its consumer in Suspense, but since
 * the mocked hooks resolve synchronously the boundary never falls back —
 * making the assertions deterministic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';

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

const trackMock = vi.fn();
vi.mock('@/lib/analytics/events', () => ({
  Events: {
    PageView: 'page_view',
    PageviewLanding: 'pageview_landing',
    BeginCheckout: 'begin_checkout',
    RegisterContractCompleted: 'register_contract_completed',
  },
  track: (...args: unknown[]) => trackMock(...args),
}));

import { RouteChangeTracker } from './route-change-tracker';

beforeEach(() => {
  trackMock.mockClear();
  navigationState.pathname = '/';
  navigationState.search = '';
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('RouteChangeTracker', () => {
  it('should emit page_view once on mount with the current pathname', () => {
    navigationState.pathname = '/contratar';
    navigationState.search = '';
    render(<RouteChangeTracker />);

    const pageViewCalls = trackMock.mock.calls.filter(
      (call) => call[0] === 'page_view',
    );
    expect(pageViewCalls).toHaveLength(1);
    expect(pageViewCalls[0]?.[1]).toEqual({ page_path: '/contratar' });
  });

  it('should include the query string in page_path when search params are present', () => {
    navigationState.pathname = '/';
    navigationState.search = 'utm_source=instagram&utm_campaign=lancamento';
    render(<RouteChangeTracker />);

    const pageViewCalls = trackMock.mock.calls.filter(
      (call) => call[0] === 'page_view',
    );
    expect(pageViewCalls[0]?.[1]).toEqual({
      page_path: '/?utm_source=instagram&utm_campaign=lancamento',
    });
  });

  it('should additionally emit pageview_landing when the pathname is "/"', () => {
    navigationState.pathname = '/';
    navigationState.search = '';
    render(<RouteChangeTracker />);

    const landingCalls = trackMock.mock.calls.filter(
      (call) => call[0] === 'pageview_landing',
    );
    expect(landingCalls).toHaveLength(1);
  });

  it('should not emit pageview_landing on non-root routes', () => {
    navigationState.pathname = '/contratar';
    navigationState.search = '';
    render(<RouteChangeTracker />);

    const landingCalls = trackMock.mock.calls.filter(
      (call) => call[0] === 'pageview_landing',
    );
    expect(landingCalls).toHaveLength(0);
  });

  it('should emit a new page_view on pathname change', () => {
    navigationState.pathname = '/';
    navigationState.search = '';
    const view = render(<RouteChangeTracker />);

    expect(
      trackMock.mock.calls.filter((c) => c[0] === 'page_view'),
    ).toHaveLength(1);

    act(() => {
      navigationState.pathname = '/contratar';
      navigationState.search = '';
    });
    view.rerender(<RouteChangeTracker />);

    const pageViewCalls = trackMock.mock.calls.filter(
      (call) => call[0] === 'page_view',
    );
    expect(pageViewCalls).toHaveLength(2);
    expect(pageViewCalls[1]?.[1]).toEqual({ page_path: '/contratar' });
  });

  it('should not duplicate page_view when re-rendered with the same pathname/search', () => {
    navigationState.pathname = '/contratar';
    navigationState.search = '';
    const view = render(<RouteChangeTracker />);

    view.rerender(<RouteChangeTracker />);
    view.rerender(<RouteChangeTracker />);

    const pageViewCalls = trackMock.mock.calls.filter(
      (call) => call[0] === 'page_view',
    );
    expect(pageViewCalls).toHaveLength(1);
  });
});
