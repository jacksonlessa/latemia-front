/**
 * Unit tests for the `MetaPixel` component.
 *
 * Same structure as `ga4.test.tsx`: env vars are captured at module load
 * time, so we use `vi.resetModules()` + dynamic import to flip the var
 * between cases.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

vi.mock('next/script', () => ({
  default: ({
    id,
    strategy,
    dangerouslySetInnerHTML,
  }: {
    id?: string;
    strategy?: string;
    dangerouslySetInnerHTML?: { __html: string };
  }) => (
    <span
      data-testid="next-script-mock"
      data-script-id={id}
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

describe('MetaPixel', () => {
  it('should render null when NEXT_PUBLIC_META_PIXEL_ID is undefined', async () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '');
    const { MetaPixel } = await import('./meta-pixel');
    const { container } = render(<MetaPixel />);
    expect(container.querySelector('[data-testid="next-script-mock"]')).toBeNull();
  });

  it('should render the official snippet with init + revoked consent when the ID is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '987654321');
    const { MetaPixel } = await import('./meta-pixel');
    const { container } = render(<MetaPixel />);

    const script = container.querySelector(
      '[data-testid="next-script-mock"]',
    );
    expect(script).not.toBeNull();
    expect(script?.getAttribute('data-script-id')).toBe('meta-pixel');
    expect(script?.getAttribute('data-script-strategy')).toBe(
      'afterInteractive',
    );
    const body = script?.getAttribute('data-script-body') ?? '';
    // Official snippet markers
    expect(body).toContain('fbevents.js');
    expect(body).toContain("fbq('init', '987654321')");
    // Consent default-revoked → flipped to grant by ConsentProvider
    expect(body).toContain("fbq('consent', 'revoke')");
  });
});
