/**
 * Formats a BR mobile E.164 number (`+55XXXXXXXXXXX`) for display in the
 * tutor's own checkout/OTP flow (full digits, no asterisks).
 *
 * LGPD: used only where the tutor already knows/owns the number (same
 * session). Admin list views and API `phone_masked` responses stay masked.
 *
 * Examples:
 *  - `'+5511987654321'` → `'(11) 98765-4321'`
 *  - `'+5547995221932'` → `'(47) 99522-1932'`
 *  - malformed / empty → `''`
 */

import { applyMask } from '@/components/ui/phone-input';

const E164_BR_MOBILE = /^\+55(\d{11})$/;

/**
 * Returns a Brazilian national mask for a valid E.164 BR mobile, or `''`
 * when the input is not `+55` + 11 digits.
 */
export function formatE164BrMobileDisplay(e164: string): string {
  if (typeof e164 !== 'string' || e164.length === 0) {
    return '';
  }

  const match = E164_BR_MOBILE.exec(e164);
  if (!match) {
    return '';
  }

  return applyMask(match[1]);
}
