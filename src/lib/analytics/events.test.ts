import { afterEach, describe, expect, it, vi } from 'vitest';
import { Events, track } from './events';

afterEach(() => {
  delete (window as unknown as { gtag?: unknown }).gtag;
  delete (window as unknown as { fbq?: unknown }).fbq;
});

describe('track', () => {
  it('should send standard Meta PageView when event is page_view', () => {
    const fbqSpy = vi.fn();
    (window as unknown as { fbq: typeof fbqSpy }).fbq = fbqSpy;

    track(Events.PageView, { page_path: '/contratar' });

    expect(fbqSpy).toHaveBeenCalledWith('trackCustom', 'page_view', {
      page_path: '/contratar',
    });
    expect(fbqSpy).toHaveBeenCalledWith('track', 'PageView', {
      page_path: '/contratar',
    });
  });

  it('should not send standard Meta PageView for non-page_view events', () => {
    const fbqSpy = vi.fn();
    (window as unknown as { fbq: typeof fbqSpy }).fbq = fbqSpy;

    track(Events.BeginCheckout);

    expect(fbqSpy).toHaveBeenCalledWith('trackCustom', 'begin_checkout', undefined);
    expect(
      fbqSpy.mock.calls.filter((c) => c[0] === 'track' && c[1] === 'PageView'),
    ).toHaveLength(0);
  });
});
