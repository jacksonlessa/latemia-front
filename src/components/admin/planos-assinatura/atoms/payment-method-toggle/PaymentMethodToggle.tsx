'use client';

import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/lib/billing/types';

interface PaymentMethodToggleProps {
  value: PaymentMethod[];
  onChange: (value: PaymentMethod[]) => void;
  disabled?: boolean;
  className?: string;
}

const METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'credit_card', label: 'Cartão de crédito' },
  { value: 'debit_card', label: 'Cartão de débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cash', label: 'Dinheiro' },
];

/**
 * Multi-select toggle for payment methods.
 * Receives/emits an array of selected PaymentMethod values.
 */
export function PaymentMethodToggle({ value, onChange, disabled = false, className }: PaymentMethodToggleProps) {
  function toggle(method: PaymentMethod) {
    if (disabled) return;
    if (value.includes(method)) {
      onChange(value.filter((m) => m !== method));
    } else {
      onChange([...value, method]);
    }
  }

  return (
    <fieldset className={cn('border-0 p-0 m-0', className)} disabled={disabled}>
      <legend className="sr-only">Métodos de pagamento</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Métodos de pagamento">
        {METHOD_OPTIONS.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => toggle(opt.value)}
              className={cn(
                'inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75] focus-visible:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
                selected
                  ? 'border-[#4E8C75] bg-[#EAF4F0] text-[#4E8C75]'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
