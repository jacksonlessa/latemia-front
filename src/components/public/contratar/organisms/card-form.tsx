'use client';

import { useEffect, useRef } from 'react';
import {
  CardCvvInput,
  CardExpiryInput,
  CardHolderInput,
  CardNumberInput,
} from '@/components/public/contratar/atoms';

export type CardFormField = 'number' | 'holderName' | 'expiry' | 'cvv';

export interface CardFormValue {
  /** Apenas dígitos (16–19). */
  number: string;
  holderName: string;
  /** Apenas dígitos no formato `MMYY`. */
  expiry: string;
  /** Apenas dígitos (3–4). */
  cvv: string;
}

export type CardFormErrors = Partial<Record<CardFormField, string>>;

export interface CardFormProps {
  value: CardFormValue;
  onChange: (field: CardFormField, value: string) => void;
  errors?: CardFormErrors;
  disabled?: boolean;
  /**
   * Quando muda para `true`, o CVV é resetado e o foco é colocado no campo CVV.
   * Padrão para erros de cobrança pós-tokenização (RF4 do PRD).
   */
  clearCvvOnError?: boolean;
}

export const EMPTY_CARD_FORM_VALUE: CardFormValue = {
  number: '',
  holderName: '',
  expiry: '',
  cvv: '',
};

/**
 * Organism que compõe os 4 atoms do cartão (número, nome, validade, CVV).
 *
 * LGPD/PCI: nenhum valor é persistido fora do estado do componente; os dados
 * são exclusivamente repassados para o pai por meio de `onChange`.
 */
export function CardForm({
  value,
  onChange,
  errors,
  disabled,
  clearCvvOnError,
}: CardFormProps) {
  const cvvRef = useRef<HTMLInputElement | null>(null);
  const previousClearFlag = useRef<boolean>(false);

  useEffect(() => {
    if (clearCvvOnError && !previousClearFlag.current) {
      onChange('cvv', '');
      cvvRef.current?.focus();
    }
    previousClearFlag.current = !!clearCvvOnError;
  }, [clearCvvOnError, onChange]);

  return (
    <div className="space-y-4">
      <CardNumberInput
        value={value.number}
        onChange={(next) => onChange('number', next)}
        error={errors?.number}
        disabled={disabled}
      />

      <CardHolderInput
        value={value.holderName}
        onChange={(next) => onChange('holderName', next)}
        error={errors?.holderName}
        disabled={disabled}
      />

      <div className="grid grid-cols-2 gap-3">
        <CardExpiryInput
          value={value.expiry}
          onChange={(next) => onChange('expiry', next)}
          error={errors?.expiry}
          disabled={disabled}
        />
        <CardCvvInput
          ref={cvvRef}
          value={value.cvv}
          onChange={(next) => onChange('cvv', next)}
          error={errors?.cvv}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
