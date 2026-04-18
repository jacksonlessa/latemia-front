'use client';

import { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';

function applyMask(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

interface PhoneInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  defaultValue?: string;
}

export function PhoneInput({ defaultValue = '', ...props }: PhoneInputProps) {
  const initialDigits = (defaultValue ?? '').replace(/\D/g, '');
  const [value, setValue] = useState(applyMask(initialDigits));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setValue(applyMask(digits));
  }, []);

  return (
    <Input
      {...props}
      type="tel"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      placeholder="(11) 99999-9999"
      maxLength={15}
    />
  );
}
