import { afterEach, describe, expect, it, vi } from 'vitest';
import { Events, track } from './events';

afterEach(() => {
  delete (window as unknown as { gtag?: unknown }).gtag;
  delete (window as unknown as { fbq?: unknown }).fbq;
});

describe('track', () => {
  it('should send Meta trackCustom for page_view', () => {
    const fbqSpy = vi.fn();
    (window as unknown as { fbq: typeof fbqSpy }).fbq = fbqSpy;

    track(Events.PageView, { page_path: '/contratar' });

    expect(fbqSpy).toHaveBeenCalledWith('trackCustom', 'page_view', {
      page_path: '/contratar',
    });
    expect(
      fbqSpy.mock.calls.filter((c) => c[0] === 'track' && c[1] === 'PageView'),
    ).toHaveLength(0);
  });

  it('should send trackCustom only for non-page_view funnel events', () => {
    const fbqSpy = vi.fn();
    (window as unknown as { fbq: typeof fbqSpy }).fbq = fbqSpy;

    track(Events.BeginCheckout);

    expect(fbqSpy).toHaveBeenCalledWith('trackCustom', 'begin_checkout', undefined);
    expect(
      fbqSpy.mock.calls.filter((c) => c[0] === 'track' && c[1] === 'PageView'),
    ).toHaveLength(0);
  });
});
