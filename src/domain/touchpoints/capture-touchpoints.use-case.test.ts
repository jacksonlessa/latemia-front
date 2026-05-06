/**
 * Unit tests for `captureTouchpointFromUrl`.
 *
 * The function is pure — these tests exercise parsing of UTM/click-id/ref
 * parameters and the handling of missing/empty values. No DOM access.
 */

import { describe, it, expect } from 'vitest';
import {
  captureTouchpointFromUrl,
  hasAttributionData,
} from './capture-touchpoints.use-case';

const FIXED_NOW = new Date('2026-05-04T12:34:56.000Z');

describe('captureTouchpointFromUrl', () => {
  it('should parse all UTM params, click IDs, and ref when present', () => {
    const search =
      '?utm_source=instagram&utm_medium=social&utm_campaign=lancamento' +
      '&utm_content=video1&utm_term=plano&gclid=abc123&fbclid=fb456&ref=podcastXYZ';

    const result = captureTouchpointFromUrl(
      search,
      'https://example.com/anywhere',
      FIXED_NOW,
    );

    expect(result.utmSource).toBe('instagram');
    expect(result.utmMedium).toBe('social');
    expect(result.utmCampaign).toBe('lancamento');
    expect(result.utmContent).toBe('video1');
    expect(result.utmTerm).toBe('plano');
    expect(result.gclid).toBe('abc123');
    expect(result.fbclid).toBe('fb456');
    expect(result.referrer).toBe('https://example.com/anywhere');
    expect(result.referralCode).toBe('podcastXYZ');
    expect(result.capturedAt).toBe('2026-05-04T12:34:56.000Z');
  });

  it('should accept partial params and set the rest to null', () => {
    const result = captureTouchpointFromUrl(
      '?utm_source=meta&fbclid=ABC',
      '',
      FIXED_NOW,
    );

    expect(result.utmSource).toBe('meta');
    expect(result.utmMedium).toBeNull();
    expect(result.utmCampaign).toBeNull();
    expect(result.utmContent).toBeNull();
    expect(result.utmTerm).toBeNull();
    expect(result.gclid).toBeNull();
    expect(result.fbclid).toBe('ABC');
    expect(result.referrer).toBeNull();
    expect(result.referralCode).toBeNull();
  });

  it('should produce all-null fields when query string is empty', () => {
    const result = captureTouchpointFromUrl('', '', FIXED_NOW);

    expect(result.utmSource).toBeNull();
    expect(result.utmMedium).toBeNull();
    expect(result.utmCampaign).toBeNull();
    expect(result.utmContent).toBeNull();
    expect(result.utmTerm).toBeNull();
    expect(result.gclid).toBeNull();
    expect(result.fbclid).toBeNull();
    expect(result.referrer).toBeNull();
    expect(result.referralCode).toBeNull();
    expect(result.capturedAt).toBe('2026-05-04T12:34:56.000Z');
  });

  it('should treat empty parameter values as null', () => {
    const result = captureTouchpointFromUrl(
      '?utm_source=&utm_campaign=launch',
      '',
      FIXED_NOW,
    );

    expect(result.utmSource).toBeNull();
    expect(result.utmCampaign).toBe('launch');
  });

  it('should normalize an empty referrer string to null', () => {
    const result = captureTouchpointFromUrl('?utm_source=x', '', FIXED_NOW);
    expect(result.referrer).toBeNull();
  });

  it('should preserve a non-empty referrer verbatim', () => {
    const result = captureTouchpointFromUrl(
      '',
      'https://t.co/abc',
      FIXED_NOW,
    );
    expect(result.referrer).toBe('https://t.co/abc');
  });

  it('should not access the DOM (referrer comes from argument)', () => {
    // Indirectly verified: the function signature requires referrer; if it
    // touched `document.referrer` we would not be able to override it here.
    const result = captureTouchpointFromUrl('', 'override', FIXED_NOW);
    expect(result.referrer).toBe('override');
  });
});

describe('hasAttributionData', () => {
  it('should return false when every field is null', () => {
    const empty = captureTouchpointFromUrl('', '', FIXED_NOW);
    expect(hasAttributionData(empty)).toBe(false);
  });

  it('should return true when at least one UTM is present', () => {
    const t = captureTouchpointFromUrl('?utm_source=ig', '', FIXED_NOW);
    expect(hasAttributionData(t)).toBe(true);
  });

  it('should return true when only fbclid is present', () => {
    const t = captureTouchpointFromUrl('?fbclid=AB', '', FIXED_NOW);
    expect(hasAttributionData(t)).toBe(true);
  });

  it('should return true when only the referrer is set', () => {
    const t = captureTouchpointFromUrl('', 'https://google.com', FIXED_NOW);
    expect(hasAttributionData(t)).toBe(true);
  });
});
