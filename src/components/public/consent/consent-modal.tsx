'use client';

/**
 * "Personalizar" modal — toggles per cookie category. The "Essenciais"
 * category is fixed `on` and disabled (LGPD §necessary cookies are exempt
 * from consent). Analytics and Marketing are independently toggleable.
 *
 * Built on the existing shadcn `Dialog` (Radix Dialog) which already provides
 * `role="dialog"`, focus trapping, `Esc` to close, and an accessible close
 * button. Saving the form calls `update()` on the consent provider with both
 * categories, persisting the decision and closing the modal.
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  useConsent,
  type ConsentSignal,
} from './consent-provider';

export function ConsentModal(): React.ReactElement {
  const { state, preferencesOpen, closePreferences, update } = useConsent();
  const [localAnalytics, setLocalAnalytics] = useState<ConsentSignal>(
    state.analytics,
  );
  const [localMarketing, setLocalMarketing] = useState<ConsentSignal>(
    state.marketing,
  );

  // Sync local toggles with persisted state whenever the modal opens —
  // ensures the form always reflects the latest choice.
  useEffect(() => {
    if (preferencesOpen) {
      setLocalAnalytics(state.analytics);
      setLocalMarketing(state.marketing);
    }
  }, [preferencesOpen, state.analytics, state.marketing]);

  const handleSave = (): void => {
    update({ analytics: localAnalytics, marketing: localMarketing });
  };

  return (
    <Dialog
      open={preferencesOpen}
      onOpenChange={(open) => {
        if (!open) closePreferences();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Preferências de cookies</DialogTitle>
          <DialogDescription>
            Escolha quais categorias de cookies você permite. Cookies
            essenciais são sempre ativos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Essenciais</Label>
              <p className="text-xs text-zinc-600">
                Necessários para autenticação, segurança e preferências
                básicas. Sempre ativos.
              </p>
            </div>
            <Switch
              checked
              disabled
              aria-label="Cookies essenciais (sempre ativos)"
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <Label
                htmlFor="consent-analytics"
                className="text-sm font-medium"
              >
                Analytics
              </Label>
              <p className="text-xs text-zinc-600">
                Métricas anônimas de uso para melhorar a experiência (Google
                Analytics 4).
              </p>
            </div>
            <Switch
              id="consent-analytics"
              checked={localAnalytics === 'granted'}
              onCheckedChange={(checked) =>
                setLocalAnalytics(checked ? 'granted' : 'denied')
              }
              aria-label="Cookies de analytics"
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <Label
                htmlFor="consent-marketing"
                className="text-sm font-medium"
              >
                Marketing
              </Label>
              <p className="text-xs text-zinc-600">
                Permite atribuir campanhas e mostrar anúncios relevantes
                (Meta Pixel, Google Ads). Sem o consentimento, dados de origem
                ficam apenas na sessão atual.
              </p>
            </div>
            <Switch
              id="consent-marketing"
              checked={localMarketing === 'granted'}
              onCheckedChange={(checked) =>
                setLocalMarketing(checked ? 'granted' : 'denied')
              }
              aria-label="Cookies de marketing"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closePreferences}
            aria-label="Cancelar e fechar preferências"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            aria-label="Salvar preferências de cookies"
          >
            Salvar preferências
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
