'use client';

import { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';

function applyMask(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

interface CpfInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  defaultValue?: string;
}

export function CpfInput({ defaultValue = '', ...props }: CpfInputProps) {
  const initialDigits = (defaultValue ?? '').replace(/\D/g, '');
  const [value, setValue] = useState(applyMask(initialDigits));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setValue(applyMask(digits));
  }, []);

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      placeholder="000.000.000-00"
      maxLength={14}
    />
  );
}
