import { describe, it, expect } from 'vitest';
import { landingContent } from './landing';
import { publicSite } from '@/config/public-site';

describe('landing content integrity', () => {
  it('should have priceCents === 2500 in both landingContent and publicSite', () => {
    expect(landingContent.pricing.priceCents).toBe(2500);
    expect(publicSite.price.perPetCents).toBe(2500);
  });

  it('should have whatsapp.number === 5547999965009 in both sources', () => {
    expect(landingContent.contact.whatsapp.number).toBe('5547999965009');
    expect(publicSite.whatsapp.number).toBe('5547999965009');
  });

  it('should have 5 to 8 FAQ entries', () => {
    expect(landingContent.faq.items.length).toBeGreaterThanOrEqual(5);
    expect(landingContent.faq.items.length).toBeLessThanOrEqual(8);
  });

  it('should have exactly 3 testimonials with rating between 1 and 5', () => {
    expect(landingContent.testimonials.items).toHaveLength(3);
    for (const t of landingContent.testimonials.items) {
      expect(t.rating).toBeGreaterThanOrEqual(1);
      expect(t.rating).toBeLessThanOrEqual(5);
    }
  });

  it('should have all required top-level sections filled', () => {
    expect(landingContent.hero.title).toBeTruthy();
    expect(landingContent.benefits.items.length).toBeGreaterThan(0);
    expect(landingContent.coverage.items.length).toBeGreaterThan(0);
    expect(landingContent.exclusions.items.length).toBeGreaterThan(0);
    expect(landingContent.gracePeriod.months).toBe(6);
    expect(landingContent.contact.address).toBeTruthy();
  });

  it('should have checkoutPath === /contratar in publicSite', () => {
    expect(publicSite.checkoutPath).toBe('/contratar');
  });
});
