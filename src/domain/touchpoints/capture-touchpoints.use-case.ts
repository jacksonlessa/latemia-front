/**
 * Pure use-case that turns a URL search string + referrer + clock into a
 * `Touchpoint`. No I/O, no DOM access — testable in isolation.
 *
 * Caller is responsible for sourcing `search` (e.g. `window.location.search`
 * or the `useSearchParams` value) and `referrer` (e.g. `document.referrer`).
 */

import type { Touchpoint } from './touchpoints.types';

/**
 * Returns true if the touchpoint carries at least one meaningful attribution
 * field. Used to decide whether a route change should refresh `lastTouch`.
 */
export function hasAttributionData(touchpoint: Touchpoint): boolean {
  return (
    touchpoint.utmSource !== null ||
    touchpoint.utmMedium !== null ||
    touchpoint.utmCampaign !== null ||
    touchpoint.utmContent !== null ||
    touchpoint.utmTerm !== null ||
    touchpoint.gclid !== null ||
    touchpoint.fbclid !== null ||
    touchpoint.referralCode !== null ||
    touchpoint.referrer !== null
  );
}

export function captureTouchpointFromUrl(
  search: string,
  referrer: string,
  now: Date,
): Touchpoint {
  const params = new URLSearchParams(search);
  const get = (key: string): string | null => {
    const value = params.get(key);
    return value !== null && value !== '' ? value : null;
  };

  return {
    utmSource: get('utm_source'),
    utmMedium: get('utm_medium'),
    utmCampaign: get('utm_campaign'),
    utmContent: get('utm_content'),
    utmTerm: get('utm_term'),
    gclid: get('gclid'),
    fbclid: get('fbclid'),
    referrer: referrer && referrer.length > 0 ? referrer : null,
    referralCode: get('ref'),
    capturedAt: now.toISOString(),
  };
}
