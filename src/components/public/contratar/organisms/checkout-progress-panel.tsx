'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ProgressStep,
  type ProgressState,
} from '@/components/public/contratar/atoms/progress-step';
import type { ProgressSubStepData } from '@/components/public/contratar/atoms/progress-sub-step';
import { Button } from '@/components/ui/button';

export const CHECKOUT_STAGE_MESSAGES: Record<number, string> = {
  1: 'Validando dados do cartão...',
  2: 'Tokenizando seu cartão com segurança...',
  3: 'Salvando seus dados de cadastro...',
  4: 'Cadastrando seu(s) pet(s)...',
  5: 'Conectando ao provedor de pagamento...',
  6: 'Configurando assinatura para seus pets...',
  7: 'Finalizando sua contratação...',
  8: 'Pronto! Redirecionando...',
};

export const CHECKOUT_TOTAL_STAGES = 8;

/** Atraso mínimo antes que um estado novo seja exibido (anti-flicker). */
export const ANTI_FLICKER_MS = 300;

export interface CheckoutPetStage {
  /** Nome exibido (ex.: "Rex"). */
  name: string;
  state: ProgressState;
  /** Mensagem de erro a exibir quando state === 'error'. */
  errorMessage?: string;
}

export interface CheckoutProgressPanelProps {
  /** Etapa atual (1..8). Etapas anteriores aparecem como `done`, futuras como `pending`. */
  currentStage: number;
  /** Sub-itens da etapa 6 (1 por pet). */
  petStages?: CheckoutPetStage[];
  /** Etapa que falhou; quando definida, sobrepõe o estado dessa etapa para `error`. */
  errorStage?: number;
  /** Mensagem de erro localizada exibida na etapa que falhou. */
  errorMessage?: string;
  /** Callback do botão "Tentar novamente" — quando ausente, o botão não é renderizado. */
  onRetry?: () => void;
  /** Quando true, renderiza como overlay modal com foco preso. Default: true. */
  asOverlay?: boolean;
  /** Título visível (configurável para SR + aria-labelledby). */
  title?: string;
}

function getStageState(
  stage: number,
  currentStage: number,
  errorStage: number | undefined,
): ProgressState {
  if (errorStage !== undefined && stage === errorStage) return 'error';
  if (stage < currentStage) return 'done';
  if (stage === currentStage) {
    // Se houve erro anterior, etapas posteriores ficam pending.
    if (errorStage !== undefined && currentStage > errorStage) return 'pending';
    return 'in_progress';
  }
  return 'pending';
}

function petStageToSub(p: CheckoutPetStage, idx: number): ProgressSubStepData {
  return {
    id: `${idx}-${p.name}`,
    label: `Configurando assinatura para ${p.name}`,
    state: p.state,
    errorMessage: p.errorMessage,
  };
}

/**
 * Hook anti-flicker: garante que a etapa exibida só avança após `ANTI_FLICKER_MS`,
 * evitando piscadas quando uma etapa termina rapidamente. Não atrasa o estado de erro.
 */
function useAntiFlickerStage(targetStage: number, errorStage?: number): number {
  const [shownStage, setShownStage] = useState(targetStage);
  const lastChangeRef = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Erro deve ser refletido imediatamente.
    if (errorStage !== undefined) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShownStage(targetStage);
      lastChangeRef.current = Date.now();
      return;
    }

    if (targetStage === shownStage) return;

    const elapsed = Date.now() - lastChangeRef.current;
    const delay = Math.max(0, ANTI_FLICKER_MS - elapsed);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShownStage(targetStage);
      lastChangeRef.current = Date.now();
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [targetStage, errorStage, shownStage]);

  return shownStage;
}

/**
 * Foco preso dentro do painel enquanto renderizado como overlay.
 * Mantém o usuário em interação com o painel até retry/conclusão.
 */
function useFocusTrap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const previouslyFocused = (typeof document !== 'undefined'
      ? (document.activeElement as HTMLElement | null)
      : null);

    const container = containerRef.current;
    if (!container) return;

    const focusFirst = () => {
      const focusables = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        container.focus();
      }
    };

    focusFirst();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [enabled, containerRef]);
}

export function CheckoutProgressPanel({
  currentStage,
  petStages,
  errorStage,
  errorMessage,
  onRetry,
  asOverlay = true,
  title = 'Processando sua contratação',
}: CheckoutProgressPanelProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const safeCurrentStage = Math.min(
    Math.max(1, currentStage),
    CHECKOUT_TOTAL_STAGES,
  );
  const shownStage = useAntiFlickerStage(safeCurrentStage, errorStage);

  useFocusTrap(containerRef, asOverlay);

  const subSteps = useMemo<ProgressSubStepData[] | undefined>(() => {
    if (!petStages || petStages.length === 0) return undefined;
    return petStages.map(petStageToSub);
  }, [petStages]);

  const stages = useMemo(
    () =>
      Array.from({ length: CHECKOUT_TOTAL_STAGES }, (_, i) => i + 1).map(
        (stage) => {
          const state = getStageState(stage, shownStage, errorStage);
          const isErroredStage = errorStage === stage;
          return {
            stage,
            state,
            label: CHECKOUT_STAGE_MESSAGES[stage],
            errorMessage: isErroredStage ? errorMessage : undefined,
            subSteps: stage === 6 ? subSteps : undefined,
          };
        },
      ),
    [shownStage, errorStage, errorMessage, subSteps],
  );

  const panel = (
    <div
      ref={containerRef}
      role={asOverlay ? 'dialog' : undefined}
      aria-modal={asOverlay ? true : undefined}
      aria-labelledby={titleId}
      tabIndex={asOverlay ? -1 : undefined}
      className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl outline-none"
      style={{
        borderColor: '#E5E7EB',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <h2
        id={titleId}
        className="mb-4 text-lg font-semibold"
        style={{ color: '#1F2A1F' }}
      >
        {title}
      </h2>

      <ol className="space-y-3">
        {stages.map((s) => (
          <ProgressStep
            key={s.stage}
            state={s.state}
            label={s.label}
            subSteps={s.subSteps}
            errorMessage={s.errorMessage}
          />
        ))}
      </ol>

      {errorStage !== undefined && onRetry && (
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={onRetry}
            style={{ backgroundColor: '#4E8C75', color: '#fff' }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );

  if (!asOverlay) return panel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
    >
      {panel}
    </div>
  );
}
