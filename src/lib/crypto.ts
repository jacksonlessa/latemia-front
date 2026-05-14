/**
 * Web Crypto helpers used by the public checkout flow.
 *
 * `sha256Hex` is used to compute the SHA-256 hash of the contract text
 * (`CONTRATO_TEXTO`) at the moment the customer accepts it. The hash
 * accompanies the contract registration payload so the backend can
 * persist it inside `ContractAcceptanceEvidence` as part of the legal
 * proof of consent (PRD `otp-contrato` §F5, TechSpec §Models).
 *
 * LGPD note: the contract text is public, non-PII content — its hash is
 * not sensitive data and may be transmitted/persisted freely. The helper
 * never receives or processes PII.
 */

/**
 * Computes the lowercase hex SHA-256 digest of the provided string using
 * the Web Crypto API (`crypto.subtle.digest`).
 *
 * Fallback: when `crypto.subtle` is unavailable (very old browsers, some
 * non-secure contexts) the helper logs a warning and returns an empty
 * string. The backend tolerates the empty value — evidence is still
 * stored with the remaining proof fields (`acceptedAt`, `acceptedIp`,
 * `phoneMasked`). Avoiding a hard failure here keeps the funnel alive on
 * degraded environments.
 */
export async function sha256Hex(input: string): Promise<string> {
  if (
    typeof crypto === 'undefined' ||
    typeof crypto.subtle === 'undefined' ||
    typeof crypto.subtle.digest !== 'function'
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      'sha256Hex: crypto.subtle unavailable — returning empty digest',
    );
    return '';
  }

  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
