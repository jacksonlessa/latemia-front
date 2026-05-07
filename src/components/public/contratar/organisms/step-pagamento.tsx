'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { CheckoutSummaryItem } from '@/components/public/contratar/molecules/checkout-summary-item';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CardForm,
  EMPTY_CARD_FORM_VALUE,
  type CardFormErrors,
  type CardFormField,
  type CardFormValue,
} from './card-form';
import { CheckoutProgressPanel } from './checkout-progress-panel';
import type { CheckoutSummary } from '@/domain/checkout/checkout.types';
import { formatBRL } from '@/lib/currency';

export type StepPagamentoMode = 'form' | 'processing' | 'error';

export interface StepPagamentoProps {
  summary: CheckoutSummary;
  onSubmit: (cardInput: CardFormValue) => void;
  onBack: () => void;
  onRetry?: () => void;
  /** Modo visual do passo. */
  mode?: StepPagamentoMode;
  /** Estado do painel de progresso quando `mode !== 'form'`. */
  currentStage?: number;
  errorStage?: number;
  errorMessage?: string;
  /** Erro inline acima dos botões (para erros pré-tokenização). */
  formError?: string;
  /** Quando true, força reset de CVV no CardForm (RF12). */
  clearCvvOnError?: boolean;
}

export function StepPagamento({
  summary,
  onSubmit,
  onBack,
  onRetry,
  mode = 'form',
  currentStage = 1,
  errorStage,
  errorMessage,
  formError,
  clearCvvOnError,
}: StepPagamentoProps) {
  const [cardValue, setCardValue] = useState<CardFormValue>(
    EMPTY_CARD_FORM_VALUE,
  );
  const [cardErrors] = useState<CardFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Quando o pai sinaliza nova tentativa (mode 'form' após erro), reabilita
  // o botão e reseta o estado local de submitting.
  useEffect(() => {
    if (mode === 'form') {
      setSubmitting(false);
    }
  }, [mode]);

  const handleCardChange = useCallback(
    (field: CardFormField, value: string) => {
      setCardValue((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleConcluirClick = useCallback(() => {
    if (submitting) return;
    // Desabilita IMEDIATAMENTE — RF6 (sem dependência de re-render assíncrono).
    setSubmitting(true);
    onSubmit(cardValue);
  }, [cardValue, onSubmit, submitting]);

  const showProgress = mode === 'processing' || mode === 'error';
  const buttonDisabled = submitting || mode !== 'form';

  const summaryBlock = useMemo(
    () => (
      <>
        <div className="rounded-lg border border-border bg-white p-4 space-y-1 divide-y divide-border">
          {summary.pets.map((pet, index) => (
            <CheckoutSummaryItem
              key={`${pet.name}-${index}`}
              petName={pet.name}
              species={pet.species}
              pricePerPetCents={summary.pricePerPetCents}
            />
          ))}
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <Separator className="mb-3" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Total ({summary.pets.length}{' '}
              {summary.pets.length === 1 ? 'pet' : 'pets'})
            </span>
            <span className="text-base font-bold text-forest tabular-nums">
              {formatBRL(summary.totalCents)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">por mês</p>
        </div>
      </>
    ),
    [summary],
  );

  return (
    <div className="space-y-6">
      {summaryBlock}

      {!showProgress && (
        <>
          <CardForm
            value={cardValue}
            onChange={handleCardChange}
            errors={cardErrors}
            disabled={submitting}
            clearCvvOnError={clearCvvOnError}
          />

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={buttonDisabled}
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleConcluirClick}
              className="flex-1 bg-[#4E8C75] hover:bg-[#3d7260] text-white"
              disabled={buttonDisabled}
            >
              Concluir
            </Button>
          </div>
        </>
      )}

      {showProgress && (
        <CheckoutProgressPanel
          asOverlay={false}
          currentStage={currentStage}
          errorStage={mode === 'error' ? errorStage : undefined}
          errorMessage={mode === 'error' ? errorMessage : undefined}
          onRetry={mode === 'error' ? onRetry : undefined}
        />
      )}
    </div>
  );
}
