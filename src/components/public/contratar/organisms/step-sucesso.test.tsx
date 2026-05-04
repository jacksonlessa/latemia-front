/**
 * Unit tests for `StepSucesso`. Focuses on the analytics side-effect added
 * by task 6.0 — `register_contract_completed` must fire exactly once on
 * mount, with the documented payload contract `{ value, currency, items_count }`.
 *
 * The `track()` helper is mocked at the module boundary so we don't have to
 * stand up `window.gtag` / `window.fbq` in jsdom. Visual aspects of the
 * component are covered by Storybook fixtures (no UI assertions here).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

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

import { StepSucesso } from './step-sucesso';

beforeEach(() => {
  trackMock.mockClear();
});

afterEach(() => {
  cleanup();
});

describe('StepSucesso — analytics', () => {
  it('should emit register_contract_completed on mount with value in BRL units, currency and items_count', () => {
    render(
      <StepSucesso
        clientName="Maria da Silva"
        pets={[
          { name: 'Rex', species: 'canino' },
          { name: 'Mimi', species: 'felino' },
        ]}
        totalCents={9980}
      />,
    );

    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('register_contract_completed', {
      value: 99.8,
      currency: 'BRL',
      items_count: 2,
    });
  });

  it('should still emit the event with `value: undefined` when totalCents is omitted (storybook-friendly)', () => {
    render(
      <StepSucesso
        clientName="João"
        pets={[{ name: 'Rex', species: 'canino' }]}
      />,
    );

    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('register_contract_completed', {
      value: undefined,
      currency: 'BRL',
      items_count: 1,
    });
  });

  it('should emit the event exactly once even when the parent re-renders with the same props', () => {
    const view = render(
      <StepSucesso
        clientName="Ana"
        pets={[{ name: 'Rex', species: 'canino' }]}
        totalCents={4990}
      />,
    );

    view.rerender(
      <StepSucesso
        clientName="Ana"
        pets={[{ name: 'Rex', species: 'canino' }]}
        totalCents={4990}
      />,
    );

    expect(trackMock).toHaveBeenCalledTimes(1);
  });
});
