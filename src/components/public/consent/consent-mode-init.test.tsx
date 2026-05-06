/**
 * Unit tests for `ConsentModeInit`.
 *
 * Asserts the static body of the inline script:
 *   - initializes `dataLayer`
 *   - declares the `gtag` shim
 *   - calls `gtag('consent', 'default', {...})` with all four denied
 *     signals + `wait_for_update`
 *
 * Avoids rendering the actual `<Script>` (next/script imports a bundled
 * runtime that touches Next.js internals not present in jsdom). The script
 * body is exposed as `__CONSENT_DEFAULT_SCRIPT_FOR_TESTS` for direct
 * assertions; we then verify executing it in the test realm yields the
 * expected `dataLayer` queue.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { __CONSENT_DEFAULT_SCRIPT_FOR_TESTS } from './consent-mode-init';

beforeEach(() => {
  delete (window as unknown as { gtag?: unknown }).gtag;
  delete (window as unknown as { fbq?: unknown }).fbq;
  delete (window as unknown as { dataLayer?: unknown }).dataLayer;
});

describe('ConsentModeInit — script body', () => {
  it('should declare dataLayer, gtag shim, and call consent default with the four denied signals', () => {
    const body = __CONSENT_DEFAULT_SCRIPT_FOR_TESTS;
    expect(body).toContain('window.dataLayer');
    expect(body).toContain('function gtag');
    expect(body).toContain("gtag('consent', 'default'");
    expect(body).toContain("analytics_storage: 'denied'");
    expect(body).toContain("ad_storage: 'denied'");
    expect(body).toContain("ad_user_data: 'denied'");
    expect(body).toContain("ad_personalization: 'denied'");
    expect(body).toContain('wait_for_update: 500');
  });

  it('should produce a working dataLayer + gtag shim when executed', () => {
    // Execute the script body in the current realm to verify behavior.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(__CONSENT_DEFAULT_SCRIPT_FOR_TESTS)();

    const dataLayer = (
      window as unknown as { dataLayer?: unknown[] }
    ).dataLayer;
    expect(Array.isArray(dataLayer)).toBe(true);
    expect((dataLayer as unknown[]).length).toBeGreaterThan(0);

    const firstCall = (dataLayer as unknown[])[0];
    // `gtag` pushes the `arguments` object — convert to an array for assertion.
    const args = Array.from(firstCall as ArrayLike<unknown>);
    expect(args[0]).toBe('consent');
    expect(args[1]).toBe('default');
    expect(args[2]).toMatchObject({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500,
    });

    // The `gtag` shim is exposed on window for downstream consumers.
    expect(typeof (window as unknown as { gtag?: unknown }).gtag).toBe(
      'function',
    );
  });
});
