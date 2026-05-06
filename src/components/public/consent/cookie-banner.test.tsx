/**
 * Render tests for `CookieBanner`. Asserts:
 *   - banner is visible on first visit (no stored consent)
 *   - banner is hidden when consent has been decided
 *   - the three primary actions are present and labeled
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CookieBanner } from './cookie-banner';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  ConsentProvider,
} from './consent-provider';

beforeEach(() => {
  window.localStorage.clear();
});

describe('CookieBanner', () => {
  it('should render the banner with three primary actions when no choice is stored', () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );

    expect(screen.getByTestId('cookie-banner')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /aceitar todos os cookies/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /recusar cookies n[ãa]o essenciais/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /personalizar prefer[êe]ncias/i }),
    ).toBeInTheDocument();
  });

  it('should hide the banner when a choice is already persisted', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        analytics: 'denied',
        marketing: 'denied',
        version: CONSENT_VERSION,
        decidedAt: '2026-05-04T00:00:00.000Z',
      }),
    );

    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );

    expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
  });

  it('should hide the banner after the visitor accepts', () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );

    expect(screen.getByTestId('cookie-banner')).toBeInTheDocument();

    act(() => {
      screen
        .getByRole('button', { name: /aceitar todos os cookies/i })
        .click();
    });

    expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
  });
});
