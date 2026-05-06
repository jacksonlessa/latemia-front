'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MoneyInputProps {
  /** Current value in cents (integer). */
  value: number;
  /** Called with the updated cents integer on every keystroke. */
  onChange: (cents: number) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  'aria-describedby'?: string;
}

const MAX_DIGITS = 13;

const ptBR = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function extractDigits(input: string): string {
  return input.replace(/\D/g, '').slice(0, MAX_DIGITS);
}

function digitsToCents(digits: string): number {
  if (digits === '') return 0;
  const n = parseInt(digits, 10);
  return Number.isNaN(n) ? 0 : n;
}

function centsToDisplay(cents: number): string {
  if (!Number.isFinite(cents) || cents <= 0) return '';
  return ptBR.format(cents / 100);
}

/**
 * Numeric input for monetary values in BRL.
 *
 * Input mask grows from the right as the user types: each digit is appended
 * as the least significant cent, e.g. typing 1→4→5→0→0→0 yields
 * 0,01 → 0,14 → 1,45 → 14,50 → 145,00 → 1.450,00.
 *
 * Non-digit input is rejected; thousand separators and the decimal comma are
 * inserted automatically. The component works with integer cents internally
 * and externally — parents always send/receive cents.
 */
export function MoneyInput({
  value,
  onChange,
  label,
  id,
  disabled = false,
  placeholder = '0,00',
  className,
  'aria-describedby': ariaDescribedBy,
}: MoneyInputProps) {
  const inputId = id ?? 'money-input';
  const inputRef = useRef<HTMLInputElement>(null);
  const [display, setDisplay] = useState<string>(() => centsToDisplay(value));

  useEffect(() => {
    setDisplay((current) => {
      const currentCents = digitsToCents(extractDigits(current));
      return currentCents === value ? current : centsToDisplay(value);
    });
  }, [value]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el || document.activeElement !== el) return;
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, [display]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const digits = extractDigits(event.target.value);
      const cents = digitsToCents(digits);
      setDisplay(centsToDisplay(cents));
      onChange(cents);
    },
    [onChange],
  );

  const handleSelect = useCallback((event: React.SyntheticEvent<HTMLInputElement>) => {
    const el = event.currentTarget;
    const len = el.value.length;
    if (el.selectionStart !== len || el.selectionEnd !== len) {
      el.setSelectionRange(len, len);
    }
  }, []);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none"
          aria-hidden="true"
        >
          R$
        </span>
        <Input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={display}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          onSelect={handleSelect}
          aria-describedby={ariaDescribedBy}
          aria-label={label ? undefined : 'Valor em reais'}
          className="pl-9"
        />
      </div>
    </div>
  );
}
