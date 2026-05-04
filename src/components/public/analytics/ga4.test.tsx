/**
 * Unit tests for the `GA4` component.
 *
 * The measurement ID is read from `process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID`
 * AT MODULE LOAD TIME. Vitest's `vi.stubEnv` only takes effect for re-evaluated
 * imports, so we use `vi.resetModules()` + dynamic `import()` to test both the
 * "absent" and "present" branches deterministically.
 *
 * `next/script` is mocked to avoid pulling in the Next.js runtime that lives
 * outside jsdom. The mock just renders a stable element exposing the props
 * we care about (id/src/strategy) so tests can assert on the wire output
 * without scraping the bundled `<Script>` implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('next/script', () => ({
  default: ({
    id,
    src,
    strategy,
    dangerouslySetInnerHTML,
  }: {
    id?: string;
    src?: string;
    strategy?: string;
    dangerouslySetInnerHTML?: { __html: string };
  }) => (
    <span
      data-testid="next-script-mock"
      data-script-id={id}
      data-script-src={src ?? ''}
      data-script-strategy={strategy ?? ''}
      data-script-body={dangerouslySetInnerHTML?.__html ?? ''}
    />
  ),
}));

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('GA4', () => {
  it('should render null when NEXT_PUBLIC_GA4_MEASUREMENT_ID is undefined', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', '');
    const { GA4 } = await import('./ga4');
    const { container } = render(<GA4 />);
    expect(container.querySelector('[data-testid="next-script-mock"]')).toBeNull();
  });

  it('should render two Script tags (loader + config) when the ID is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_MEASUREMENT_ID', 'G-TEST123');
    const { GA4 } = await import('./ga4');
    const { container } = render(<GA4 />);
    const scripts = container.querySelectorAll(
      '[data-testid="next-script-mock"]',
    );
    expect(scripts).toHaveLength(2);

    const loader = scripts[0] as HTMLElement;
    expect(loader.getAttribute('data-script-id')).toBe('ga4-loader');
    expect(loader.getAttribute('data-script-src')).toBe(
      'https://www.googletagmanager.com/gtag/js?id=G-TEST123',
    );
    expect(loader.getAttribute('data-script-strategy')).toBe('afterInteractive');

    const config = scripts[1] as HTMLElement;
    expect(config.getAttribute('data-script-id')).toBe('ga4-config');
    expect(config.getAttribute('data-script-strategy')).toBe('afterInteractive');
    const body = config.getAttribute('data-script-body') ?? '';
    expect(body).toContain("gtag('js', new Date())");
    expect(body).toContain("gtag('config', 'G-TEST123'");
    expect(body).toContain('send_page_view: false');
  });
});
