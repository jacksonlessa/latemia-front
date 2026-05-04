'use client';

/**
 * Cookie consent banner. Fixed at the bottom of the viewport, never overlays
 * content (no full-screen backdrop). Three actions, all visually equivalent
 * per LGPD: "Aceitar todos", "Recusar não essenciais", "Personalizar".
 *
 * Visibility is fully driven by `useConsent().needsDecision`:
 *   - first visit (no stored choice) → visible
 *   - any choice persisted → hidden
 *   - consent version bump → re-prompts (banner reappears)
 */

import { Button } from '@/components/ui/button';
import { useConsent } from './consent-provider';
import { ConsentModal } from './consent-modal';

export function CookieBanner(): React.ReactElement | null {
  const { needsDecision, accept, reject, openPreferences } = useConsent();

  if (!needsDecision) {
    // Modal can still be opened from the footer link via ConsentLink — the
    // ConsentModal is mounted next to the banner so the parent layout doesn't
    // need to know about it. When the banner is hidden, only the modal stays.
    return <ConsentModal />;
  }

  return (
    <>
      <div
        role="region"
        aria-label="Aviso de cookies"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white shadow-lg"
        data-testid="cookie-banner"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 text-sm text-zinc-700">
            <p className="font-medium text-zinc-900">
              Usamos cookies para melhorar sua experiência
            </p>
            <p className="mt-1">
              Cookies essenciais são sempre necessários para o site funcionar.
              Cookies de analytics e marketing nos ajudam a entender o tráfego
              e personalizar campanhas — você pode aceitar todos, recusar os
              não essenciais ou escolher por categoria.{' '}
              <a
                href="/privacidade"
                className="underline hover:text-[#4E8C75]"
              >
                Saiba mais
              </a>
              .
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={openPreferences}
              aria-label="Personalizar preferências de cookies"
            >
              Personalizar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={reject}
              aria-label="Recusar cookies não essenciais"
            >
              Recusar não essenciais
            </Button>
            <Button
              type="button"
              onClick={accept}
              aria-label="Aceitar todos os cookies"
            >
              Aceitar todos
            </Button>
          </div>
        </div>
      </div>
      <ConsentModal />
    </>
  );
}
