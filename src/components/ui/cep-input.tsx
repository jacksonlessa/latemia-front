'use client';
import { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { lookupCep, type CepResult } from '@/lib/cep';

function applyMask(digits: string): string {
  const d = digits.slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

interface CepInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  defaultValue?: string;
  onLookup?: (result: CepResult | null) => void;
  onChange?: (maskedValue: string) => void;
}

export function CepInput({ defaultValue = '', onLookup, onChange, ...props }: CepInputProps) {
  const initialDigits = (defaultValue ?? '').replace(/\D/g, '');
  const [value, setValue] = useState(applyMask(initialDigits));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const maskedValue = applyMask(digits);
    setValue(maskedValue);
    onChange?.(maskedValue);
  }, [onChange]);

  const handleBlur = useCallback(async () => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 8) {
      if (onLookup) {
        const result = await lookupCep(digits);
        onLookup(result);
      }
    } else if (onLookup) {
      onLookup(null);
    }
  }, [value, onLookup]);

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="00000-000"
      maxLength={9}
    />
  );
}
