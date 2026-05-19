import { afterEach, describe, expect, it, vi } from 'vitest';

describe('siteAbsoluteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('should not produce double slashes when NEXT_PUBLIC_SITE_URL has a trailing slash', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://plano.drcleitinho.com.br/');
    const { siteAbsoluteUrl } = await import('./seo');

    expect(siteAbsoluteUrl('/privacidade')).toBe(
      'https://plano.drcleitinho.com.br/privacidade',
    );
    expect(siteAbsoluteUrl('/sitemap.xml')).toBe(
      'https://plano.drcleitinho.com.br/sitemap.xml',
    );
    expect(siteAbsoluteUrl('/')).toBe('https://plano.drcleitinho.com.br/');
  });

  it('should join paths when SITE_URL has no trailing slash', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://plano.drcleitinho.com.br');
    const { siteAbsoluteUrl } = await import('./seo');

    expect(siteAbsoluteUrl('/contratar')).toBe(
      'https://plano.drcleitinho.com.br/contratar',
    );
  });
});
