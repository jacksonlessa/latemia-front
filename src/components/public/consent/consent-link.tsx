'use client';

/**
 * "Preferências de cookies" link — meant to live in the public footer (or
 * anywhere a permanent way to revisit the consent choice is needed). Renders
 * a plain `<button>` styled as a link so it is keyboard-accessible and not
 * confusable with a navigation anchor.
 *
 * Clicking opens the `ConsentModal` mounted alongside the `CookieBanner`
 * (both consume the same `ConsentProvider` state, so a single open flag
 * controls them).
 */

import { useConsent } from './consent-provider';

export interface ConsentLinkProps {
  className?: string;
  label?: string;
}

export function ConsentLink({
  className,
  label = 'Preferências de cookies',
}: ConsentLinkProps): React.ReactElement {
  const { openPreferences } = useConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      className={
        className ??
        'inline-flex cursor-pointer items-center text-sm text-zinc-700 underline-offset-4 hover:text-[#4E8C75] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4E8C75]'
      }
      aria-label="Abrir preferências de cookies"
    >
      {label}
    </button>
  );
}
