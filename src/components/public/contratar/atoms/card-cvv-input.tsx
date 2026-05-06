'use client';

import { forwardRef, useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CardCvvInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  /** Tamanho máximo (3 ou 4 dígitos; default 4 para suportar Amex). */
  maxDigits?: 3 | 4;
}

export const CardCvvInput = forwardRef<HTMLInputElement, CardCvvInputProps>(
  function CardCvvInput(
    { value, onChange, label = 'CVV', error, disabled, id, maxDigits = 4 },
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
          autoComplete="cc-csc"
          placeholder={'•'.repeat(maxDigits === 3 ? 3 : 4)}
          value={value.replace(/\D/g, '').slice(0, maxDigits)}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, maxDigits))}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          maxLength={maxDigits}
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
