'use client';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Aplica máscara HH:MM em uma string de dígitos.
 *
 * Regras (clamp progressivo enquanto o usuário digita):
 * - 1º dígito da hora limitado a 0-2
 * - 2º dígito limitado a 0-3 se o primeiro for 2
 * - 1º dígito do minuto limitado a 0-5
 * - 2º dígito sem restrição (0-9)
 *
 * Aceita até 4 dígitos; formata `HH` para 1-2 dígitos e `HH:MM` para 3-4.
 */
function applyMask(input: string): string {
  const raw = input.replace(/\D/g, '').slice(0, 4).split('');

  if (raw[0] && Number(raw[0]) > 2) raw[0] = '2';
  if (raw[0] === '2' && raw[1] && Number(raw[1]) > 3) raw[1] = '3';
  if (raw[2] && Number(raw[2]) > 5) raw[2] = '5';

  const digits = raw.join('');
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function isValidHhMm(value: string): boolean {
  return HHMM_REGEX.test(value);
}

interface TimeInputProps
  extends Omit<
    React.ComponentProps<'input'>,
    'onChange' | 'value' | 'defaultValue' | 'type' | 'maxLength'
  > {
  value?: string;
  defaultValue?: string;
  onChange?: (maskedValue: string) => void;
  /** Dispara quando o input perde foco e o valor está completo (HH:MM válido). */
  onValidChange?: (value: string) => void;
}

export function TimeInput({
  value: controlledValue,
  defaultValue = '',
  onChange,
  onValidChange,
  onBlur,
  placeholder = 'HH:MM',
  ...props
}: TimeInputProps) {
  const isControlled = controlledValue !== undefined;
  const [internal, setInternal] = useState(() =>
    applyMask(controlledValue ?? defaultValue),
  );

  useEffect(() => {
    if (isControlled) {
      setInternal(applyMask(controlledValue ?? ''));
    }
  }, [controlledValue, isControlled]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = applyMask(e.target.value);
      if (!isControlled) setInternal(masked);
      onChange?.(masked);
    },
    [isControlled, onChange],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (isValidHhMm(internal)) {
        onValidChange?.(internal);
      }
      onBlur?.(e);
    },
    [internal, onBlur, onValidChange],
  );

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={internal}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={5}
    />
  );
}
