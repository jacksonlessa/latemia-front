/**
 * Unit tests for `ConsentProvider`.
 *
 * Covers:
 *   - default state is `denied/denied` for analytics + marketing
 *   - `accept()` transitions both to `granted`
 *   - `reject()` keeps both `denied` but stamps `decidedAt` (banner hides)
 *   - `update({ analytics: 'granted' })` does NOT touch marketing
 *   - persistence is versioned in `localStorage`
 *   - version bump invalidates the stored choice and re-prompts
 *   - `gtag('consent', 'update', ...)` is called with the four signals
 *   - `fbq('consent', ...)` is called when present
 *   - `lm:consent-changed` event is dispatched
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  ConsentProvider,
  useConsent,
} from './consent-provider';

function Probe(): React.ReactElement {
  const { state, needsDecision, accept, reject, update } = useConsent();
  return (
    <div>
      <span data-testid="analytics">{state.analytics}</span>
      <span data-testid="marketing">{state.marketing}</span>
      <span data-testid="version">{state.version}</span>
      <span data-testid="decided">
        {state.decidedAt === null ? 'null' : 'set'}
      </span>
      <span data-testid="needs">{needsDecision ? 'yes' : 'no'}</span>
      <button data-testid="accept" onClick={accept}>
        accept
      </button>
      <button data-testid="reject" onClick={reject}>
        reject
      </button>
      <button
        data-testid="update-analytics"
        onClick={() => update({ analytics: 'granted' })}
      >
        update-analytics
      </button>
    </div>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  // Ensure no leftover globals between tests.
  delete (window as unknown as { gtag?: unknown }).gtag;
  delete (window as unknown as { fbq?: unknown }).fbq;
  delete (window as unknown as { dataLayer?: unknown }).dataLayer;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ConsentProvider — defaults', () => {
  it('should expose denied/denied as default state with no decidedAt', () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    expect(screen.getByTestId('analytics').textContent).toBe('denied');
    expect(screen.getByTestId('marketing').textContent).toBe('denied');
    expect(screen.getByTestId('decided').textContent).toBe('null');
    expect(screen.getByTestId('version').textContent).toBe(
      String(CONSENT_VERSION),
    );
  });

  it('should report needsDecision=yes after hydration when no choice is stored', () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    expect(screen.getByTestId('needs').textContent).toBe('yes');
  });
});

describe('ConsentProvider — accept()', () => {
  it('should set both categories to granted and stamp decidedAt', () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    act(() => {
      screen.getByTestId('accept').click();
    });

    expect(screen.getByTestId('analytics').textContent).toBe('granted');
    expect(screen.getByTestId('marketing').textContent).toBe('granted');
    expect(screen.getByTestId('decided').textContent).toBe('set');
    expect(screen.getByTestId('needs').textContent).toBe('no');
  });

  it('should persist the choice to localStorage with the current version', () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    act(() => {
      screen.getByTestId('accept').click();
    });

    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string) as Record<string, unknown>;
    expect(parsed.analytics).toBe('granted');
    expect(parsed.marketing).toBe('granted');
    expect(parsed.version).toBe(CONSENT_VERSION);
    expect(typeof parsed.decidedAt).toBe('string');
  });
});

describe('ConsentProvider — reject()', () => {
  it('should keep both denied but mark decision so banner hides', () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    act(() => {
      screen.getByTestId('reject').click();
    });

    expect(screen.getByTestId('analytics').textContent).toBe('denied');
    expect(screen.getByTestId('marketing').textContent).toBe('denied');
    expect(screen.getByTestId('decided').textContent).toBe('set');
    expect(screen.getByTestId('needs').textContent).toBe('no');
  });
});

describe('ConsentProvider — update()', () => {
  it('should grant analytics without touching marketing', () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    act(() => {
      screen.getByTestId('update-analytics').click();
    });

    expect(screen.getByTestId('analytics').textContent).toBe('granted');
    expect(screen.getByTestId('marketing').textContent).toBe('denied');
  });
});

describe('ConsentProvider — versioned persistence', () => {
  it('should hydrate from localStorage when version matches', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        analytics: 'granted',
        marketing: 'granted',
        version: CONSENT_VERSION,
        decidedAt: '2026-05-04T00:00:00.000Z',
      }),
    );

    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    expect(screen.getByTestId('analytics').textContent).toBe('granted');
    expect(screen.getByTestId('marketing').textContent).toBe('granted');
    expect(screen.getByTestId('needs').textContent).toBe('no');
  });

  it('should re-prompt when stored version differs from current version', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        analytics: 'granted',
        marketing: 'granted',
        version: CONSENT_VERSION + 999,
        decidedAt: '2026-05-04T00:00:00.000Z',
      }),
    );

    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    // Version mismatch → defaults restored, banner reappears.
    expect(screen.getByTestId('analytics').textContent).toBe('denied');
    expect(screen.getByTestId('marketing').textContent).toBe('denied');
    expect(screen.getByTestId('needs').textContent).toBe('yes');
  });

  it('should ignore corrupt stored payloads without throwing', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, '{not-json');
    expect(() =>
      render(
        <ConsentProvider>
          <Probe />
        </ConsentProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByTestId('needs').textContent).toBe('yes');
  });
});

describe('ConsentProvider — third-party signal sync', () => {
  it('should call gtag("consent","update",...) with the four signals on accept', () => {
    const gtagSpy = vi.fn();
    (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;

    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    act(() => {
      screen.getByTestId('accept').click();
    });

    expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('should call gtag with denied signals on reject', () => {
    const gtagSpy = vi.fn();
    (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;

    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    act(() => {
      screen.getByTestId('reject').click();
    });

    expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('should call fbq("consent","grant") on accept and "revoke" on reject', () => {
    const fbqSpy = vi.fn();
    (window as unknown as { fbq: typeof fbqSpy }).fbq = fbqSpy;

    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    act(() => {
      screen.getByTestId('accept').click();
    });
    expect(fbqSpy).toHaveBeenCalledWith('consent', 'grant');

    act(() => {
      screen.getByTestId('reject').click();
    });
    expect(fbqSpy).toHaveBeenCalledWith('consent', 'revoke');
  });

  it('should no-op gracefully when neither gtag nor fbq are loaded', () => {
    expect(() => {
      render(
        <ConsentProvider>
          <Probe />
        </ConsentProvider>,
      );
      act(() => {
        screen.getByTestId('accept').click();
      });
    }).not.toThrow();
  });
});

describe('ConsentProvider — change event', () => {
  it('should dispatch lm:consent-changed on choice', () => {
    const listener = vi.fn();
    window.addEventListener(CONSENT_CHANGED_EVENT, listener);

    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );

    act(() => {
      screen.getByTestId('accept').click();
    });

    expect(listener).toHaveBeenCalledTimes(1);
    const evt = listener.mock.calls[0][0] as CustomEvent;
    expect(evt.detail).toMatchObject({
      analytics: 'granted',
      marketing: 'granted',
      version: CONSENT_VERSION,
    });

    window.removeEventListener(CONSENT_CHANGED_EVENT, listener);
  });
});

describe('useConsent — outside provider', () => {
  it('should return a denied/no-op default value', () => {
    function SoloProbe(): React.ReactElement {
      const { state, needsDecision } = useConsent();
      return (
        <span data-testid="solo">
          {`${state.analytics}/${state.marketing}/${needsDecision ? 'y' : 'n'}`}
        </span>
      );
    }
    render(<SoloProbe />);
    expect(screen.getByTestId('solo').textContent).toBe('denied/denied/n');
  });
});
