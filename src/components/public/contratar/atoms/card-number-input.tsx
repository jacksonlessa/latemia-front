'use client';

import { forwardRef, useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CardNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  /** Tamanho máximo de dígitos (padrão 19 para suportar Amex/Diners). */
  maxDigits?: number;
}

/**
 * Aplica máscara `#### #### #### ####` (4-4-4-4) com até 19 dígitos.
 * Exportada para testes.
 */
export function maskCardNumber(raw: string, maxDigits = 19): string {
  const digits = raw.replace(/\D/g, '').slice(0, maxDigits);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export const CardNumberInput = forwardRef<HTMLInputElement, CardNumberInputProps>(
  function CardNumberInput(
    { value, onChange, label = 'Número do cartão', error, disabled, id, maxDigits = 19 },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="space-y-1.5">
        <Label htmlFor={inputId}>{label}</Label>
        <Input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={maskCardNumber(value, maxDigits)}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, maxDigits))}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
        />
        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
