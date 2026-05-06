'use client';

/**
 * PaymentCardForm
 *
 * Molecule that renders a credit-card form and tokenizes the card data via
 * the Pagar.me API (`tokenizeCard` from `@/lib/billing/tokenize-card`).
 *
 * PCI/LGPD: PAN and CVV are held only in local React state; they are never
 * sent to the LateMia backend. Only the Pagar.me token (`cardToken`) is
 * forwarded to the parent via `onSuccess`.
 *
 * Props:
 *   - `onSuccess(cardToken)` — called with the Pagar.me token after successful tokenization
 *   - `onError?(message)` — called when tokenization fails (optional)
 *   - `disabled?` — disables all inputs and the submit button
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  CardNumberInput,
  CardHolderInput,
  CardExpiryInput,
  CardCvvInput,
} from '@/components/public/contratar/atoms';
import { tokenizeCard } from '@/lib/billing/tokenize-card';
import { ValidationError } from '@/lib/validation-error';

export interface PaymentCardFormProps {
  onSuccess: (cardToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

interface CardFormState {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
}

interface FieldErrors {
  number?: string;
  holderName?: string;
  expiry?: string;
  cvv?: string;
  _form?: string;
}

const INITIAL_STATE: CardFormState = {
  number: '',
  holderName: '',
  expiry: '',
  cvv: '',
};

export function PaymentCardForm({
  onSuccess,
  onError,
  disabled = false,
}: PaymentCardFormProps) {
  const [card, setCard] = useState<CardFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = disabled || submitting;

  const handleChange = useCallback(
    (field: keyof CardFormState, value: string) => {
      setCard((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (isDisabled) return;

    // Basic local validation
    const fieldErrors: FieldErrors = {};
    if (!card.number || card.number.length < 13) {
      fieldErrors.number = 'Informe o número do cartão';
    }
    if (!card.holderName.trim()) {
      fieldErrors.holderName = 'Informe o nome impresso no cartão';
    }
    if (!card.expiry || card.expiry.length < 4) {
      fieldErrors.expiry = 'Informe a validade do cartão';
    }
    if (!card.cvv || card.cvv.length < 3) {
      fieldErrors.cvv = 'Informe o CVV';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const expMonth = card.expiry.slice(0, 2);
      const expYear = card.expiry.slice(2, 4);

      const result = await tokenizeCard({
        number: card.number,
        holderName: card.holderName,
        expMonth,
        expYear,
        cvv: card.cvv,
      });

      onSuccess(result.cardToken);
    } catch (err) {
      let message = 'Não foi possível validar seu cartão. Tente novamente.';
      if (err instanceof ValidationError) {
        message = err.fieldErrors._form ?? message;
      }
      setErrors({ _form: message });
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  }, [card, isDisabled, onError, onSuccess]);

  return (
    <div className="space-y-4">
      <CardNumberInput
        value={card.number}
        onChange={(value) => handleChange('number', value)}
        error={errors.number}
        disabled={isDisabled}
      />

      <CardHolderInput
        value={card.holderName}
        onChange={(value) => handleChange('holderName', value)}
        error={errors.holderName}
        disabled={isDisabled}
      />

      <div className="grid grid-cols-2 gap-3">
        <CardExpiryInput
          value={card.expiry}
          onChange={(value) => handleChange('expiry', value)}
          error={errors.expiry}
          disabled={isDisabled}
        />
        <CardCvvInput
          value={card.cvv}
          onChange={(value) => handleChange('cvv', value)}
          error={errors.cvv}
          disabled={isDisabled}
        />
      </div>

      {errors._form && (
        <p className="text-sm text-destructive" role="alert">
          {errors._form}
        </p>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isDisabled}
        className="w-full bg-[#4E8C75] hover:bg-[#3d7260] text-white"
      >
        {submitting ? 'Validando cartão…' : 'Atualizar cartão'}
      </Button>
    </div>
  );
}
