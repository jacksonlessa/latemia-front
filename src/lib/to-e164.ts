/**
 * Helper to normalise Brazilian phone numbers into E.164 format
 * (`+55XXXXXXXXXXX`).
 *
 * The wizard collects phone digits in a few different shapes (mask string,
 * digits-only, already prefixed) — this helper is the single normalisation
 * point used by the OTP flow to feed the backend's `+55\d{10,11}` validator
 * without leaking PII to logs.
 *
 * LGPD: idempotent and pure — never logs or persists anything. The phone
 * itself is PII; callers must continue to handle it carefully (never log).
 */

const E164_BR_PREFIX = '+55';

/**
 * Returns the input string with the BR country code prefix, removing the
 * mask characters when present. Idempotent on already-prefixed inputs.
 *
 * Rules:
 *  - `'11987654321'` → `'+5511987654321'`
 *  - `'(11) 98765-4321'` → `'+5511987654321'`
 *  - `'+5511987654321'` → `'+5511987654321'` (unchanged)
 *  - `'+11987654321'` → `'+11987654321'` (preserved — caller already chose a country)
 *  - `'5511987654321'` → `'+5511987654321'` (BR digits with country prefix but no `+`)
 *  - `''` → `''` (empty stays empty — caller validates)
 *
 * This helper does not validate the digit count; the backend DTO does that
 * via the canonical regex `/^\+55\d{10,11}$/`. If a malformed value is
 * passed, the request will be rejected server-side with a clear `phone`
 * field error.
 */
export function digitsToE164(input: string): string {
  if (typeof input !== 'string' || input.length === 0) {
    return '';
  }

  // Already in international form — preserve as-is (the caller may have
  // chosen a non-BR country prefix). We never strip the `+`.
  if (input.startsWith('+')) {
    return input;
  }

  // Strip every non-digit (mask characters: spaces, parens, dashes).
  const digits = input.replace(/\D/g, '');

  if (digits.length === 0) {
    return '';
  }

  // If the caller already supplied the BR country code (e.g. `5511...`),
  // just prepend `+` to keep the value idempotent across multiple calls.
  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`;
  }

  return `${E164_BR_PREFIX}${digits}`;
}
