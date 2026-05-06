'use client';

import { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';

export function applyMask(digits: string): string {
  const d = digits.slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

interface PhoneInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  defaultValue?: string;
  onChange?: (maskedValue: string) => void;
}

export function PhoneInput({ defaultValue = '', onChange, ...props }: PhoneInputProps) {
  const initialDigits = (defaultValue ?? '').replace(/\D/g, '');
  const [value, setValue] = useState(applyMask(initialDigits));

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const maskedValue = applyMask(digits);
    setValue(maskedValue);
    onChange?.(maskedValue);
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const digits = text.replace(/\D/g, '').slice(0, 11);
    // Se o texto colado já era puramente numérico e não precisa de truncamento, deixa fluir
    if (digits === text) return;
    e.preventDefault();
    const maskedValue = applyMask(digits);
    setValue(maskedValue);
    onChange?.(maskedValue);
  }, [onChange]);

  return (
    <Input
      {...props}
      type="tel"
      // name não-padrão reduz chance de autofill por gerenciadores de senha
      name={props.name ?? 'tel-no-autofill'}
      // autoComplete="off" pode ser ignorado por alguns browsers;
      // se necessário, substituir por autoComplete="new-tel" como fallback
      autoComplete="off"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      placeholder="(11) 99999-9999"
      maxLength={15}
    />
  );
}
