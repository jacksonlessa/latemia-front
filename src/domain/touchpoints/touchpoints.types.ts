/**
 * Domain types for the touchpoint capture feature (PRD seo-analytics-lgpd-utm).
 *
 * A `Touchpoint` represents the marketing/origin context of a public-page visit
 * (UTM parameters, click IDs, referrer, referral code) at the moment the
 * visitor entered the site. The values come from the URL and `document.referrer`
 * — never from cookies. Persisting these values across sessions in browser
 * storage requires marketing consent (gated in task 5.0).
 *
 * LGPD: every textual field is treated as personal data of indirect type
 * (campaign metadata may carry identifiers). Never log values; only IDs.
 */

export interface Touchpoint {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer: string | null;
  referralCode: string | null;
  /** ISO-8601 timestamp generated on the device at capture time. */
  capturedAt: string;
}

/**
 * Bundle sent to the backend together with the client registration payload.
 * Both sides are optional — older clients may have stored only one of them.
 */
export interface TouchpointPayload {
  first?: Touchpoint;
  last?: Touchpoint;
}

/**
 * Value exposed by the `TouchpointProvider` Context.
 */
export interface TouchpointContextValue {
  firstTouch: Touchpoint | null;
  lastTouch: Touchpoint | null;
}
