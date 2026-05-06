'use client';

import type React from 'react';
import { cn } from '@/lib/utils';

export type PetSex = 'male' | 'female';

export interface SexToggleProps {
  id?: string;
  name?: string;
  value: PetSex | undefined;
  onChange: (value: PetSex) => void;
  disabled?: boolean;
  error?: string;
  'aria-describedby'?: string;
}

interface Option {
  label: string;
  value: PetSex;
}

const OPTIONS: Option[] = [
  { label: '♂ Macho', value: 'male' },
  { label: '♀ Fêmea', value: 'female' },
];

/**
 * Accessible segmented control for selecting a pet's sex.
 * Renders two buttons (Macho / Fêmea) behaving as a radio group.
 *
 * - Keyboard: Tab focuses the group; Left/Right arrows move selection.
 * - Semantics: `role="radiogroup"` wrapper, each option is `role="radio"`
 *   with `aria-checked` reflecting the current value.
 */
export function SexToggle({
  id,
  name,
  value,
  onChange,
  disabled,
  error,
  'aria-describedby': ariaDescribedby,
}: SexToggleProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  const describedBy = [ariaDescribedby, errorId].filter(Boolean).join(' ') || undefined;
  const hasError = Boolean(error);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const currentIndex = OPTIONS.findIndex((opt) => opt.value === value);
    const nextIndex =
      event.key === 'ArrowRight'
        ? (currentIndex + 1 + OPTIONS.length) % OPTIONS.length
        : (currentIndex - 1 + OPTIONS.length) % OPTIONS.length;
    const next = OPTIONS[nextIndex < 0 ? 0 : nextIndex];
    onChange(next.value);
  };

  return (
    <div
      id={id}
      data-name={name}
      role="radiogroup"
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
      onKeyDown={handleKeyDown}
      className="flex gap-2"
      style={{ fontVariantEmoji: 'text' } as React.CSSProperties}
    >
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-pressed={selected}
            disabled={disabled}
            tabIndex={selected || (!value && opt.value === OPTIONS[0].value) ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              selected
                ? 'border-[#4E8C75] bg-[#4E8C75] text-white'
                : 'border-border bg-background hover:bg-muted text-foreground',
              hasError && !selected && 'border-destructive',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
