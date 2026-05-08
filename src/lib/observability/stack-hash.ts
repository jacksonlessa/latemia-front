/**
 * SSR-safe stack trace hasher.
 *
 * Computes a SHA-256 digest of the given stack trace string and returns the
 * first 16 hex characters.  When `crypto.subtle` is unavailable (SSR / Node
 * without Web Crypto) an empty string is returned so callers do not need to
 * handle the async failure.
 */

/**
 * Returns a 16-character hex prefix of the SHA-256 hash of `stack`, or `''`
 * when running in an environment that lacks `crypto.subtle` (e.g. SSR).
 */
export async function hashStack(stack: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return '';

  const encoder = new TextEncoder();
  const data = encoder.encode(stack);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}
