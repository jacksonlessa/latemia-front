'use client';

import { forwardRef, useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CardExpiryInputProps {
  /** Valor cru no formato `MMYY` (apenas dígitos). */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * Aplica máscara `MM/AA`. Aceita até 4 dígitos. Mês > 12 não é forçado aqui
 * (validação acontece no organism); a máscara apenas insere a barra.
 */
export function maskCardExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/**
 * Verifica se o valor cru representa uma validade válida (MM 01–12, 4 dígitos).
 */
export function isValidExpiry(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 4) return false;
  const month = Number(digits.slice(0, 2));
  return month >= 1 && month <= 12;
}

export const CardExpiryInput = forwardRef<HTMLInputElement, CardExpiryInputProps>(
  function CardExpiryInput(
    { value, onChange, label = 'Validade', error, disabled, id },
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
          autoComplete="cc-exp"
          placeholder="MM/AA"
          value={maskCardExpiry(value)}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
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
