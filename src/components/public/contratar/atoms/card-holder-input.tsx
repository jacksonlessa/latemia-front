'use client';

import { forwardRef, useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CardHolderInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  /** Quando `true`, força uppercase no valor propagado. */
  uppercase?: boolean;
}

export const CardHolderInput = forwardRef<HTMLInputElement, CardHolderInputProps>(
  function CardHolderInput(
    {
      value,
      onChange,
      label = 'Nome impresso no cartão',
      error,
      disabled,
      id,
      uppercase = true,
    },
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
          autoComplete="cc-name"
          placeholder="Como impresso no cartão"
          value={value}
          onChange={(event) => {
            const next = uppercase ? event.target.value.toUpperCase() : event.target.value;
            onChange(next);
          }}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          style={uppercase ? { textTransform: 'uppercase' } : undefined}
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
