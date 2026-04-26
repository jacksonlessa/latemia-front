'use client';

import { useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MoneyInputProps {
  /** Current value in cents */
  value: number;
  onChange: (cents: number) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  'aria-describedby'?: string;
}

/** Formats a cents integer to a BRL display string, e.g. 10050 → "100,50" */
function centsToDisplay(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}

/** Parses a BRL display string back to cents, e.g. "100,50" → 10050 */
function displayToCents(display: string): number {
  const cleaned = display.replace(/\D/g, '');
  const parsed = parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Numeric input that works in cents internally but displays as BRL (R$).
 * The parent always receives/sends integer cents.
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
  const [displayValue, setDisplayValue] = useState<string>(centsToDisplay(value));
  const isFocused = useRef(false);

  const handleFocus = useCallback(() => {
    isFocused.current = true;
    // Show raw digits without formatting while editing
    setDisplayValue(centsToDisplay(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    const cents = displayToCents(displayValue);
    setDisplayValue(centsToDisplay(cents));
    onChange(cents);
  }, [displayValue, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits and comma
    const filtered = raw.replace(/[^0-9,]/g, '');
    setDisplayValue(filtered);
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
          id={inputId}
          type="text"
          inputMode="decimal"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-describedby={ariaDescribedBy}
          aria-label={label ? undefined : 'Valor em reais'}
          className="pl-9"
        />
      </div>
    </div>
  );
}
