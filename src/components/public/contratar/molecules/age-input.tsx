'use client';

import { useId, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgeMode = 'approximate' | 'exact';

export interface AgeInputProps {
  value?: Date;
  onChange: (birth: Date) => void;
  error?: string;
  id?: string;
}

// ---------------------------------------------------------------------------
// Pure helpers (exported for unit tests)
// ---------------------------------------------------------------------------

/**
 * Convert years + months into a `birthDate` by subtracting the total months
 * from `today`. The day is clamped to the last valid day of the target month
 * to avoid JS overflow (e.g. March 31 − 1 month → Feb 28, not Mar 3).
 */
export function ageToBirthDate(years: number, months: number, today: Date = new Date()): Date {
  const totalMonths = years * 12 + months;
  const rawMonth = today.getMonth() - (totalMonths % 12);
  const extraYears = rawMonth < 0 ? Math.ceil(-rawMonth / 12) : 0;
  const targetYear = today.getFullYear() - Math.floor(totalMonths / 12) - extraYears;
  const targetMonth = ((rawMonth % 12) + 12) % 12;
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  return new Date(targetYear, targetMonth, Math.min(today.getDate(), daysInMonth));
}

/**
 * Derive years and remaining months from a `birthDate`.
 *
 * e.g. 38 months ago → { years: 3, months: 2 }
 */
export function birthDateToYearsMonths(
  birth: Date,
  today: Date = new Date(),
): { years: number; months: number } {
  const total = monthsBetween(birth, today);
  return {
    years: Math.floor(total / 12),
    months: total % 12,
  };
}

function monthsBetween(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  let total = years * 12 + months;
  if (to.getDate() < from.getDate()) {
    total -= 1;
  }
  return Math.max(0, total);
}

function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const d = new Date(year, month, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AgeInput({ value, onChange, error, id }: AgeInputProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const yearsId = `${baseId}-years`;
  const monthsId = `${baseId}-months`;
  const dateId = `${baseId}-date`;
  const toggleId = `${baseId}-mode-toggle`;
  const errorId = `${baseId}-error`;

  const [isExact, setIsExact] = useState<boolean>(false);

  const [approxYears, setApproxYears] = useState<string>(() => {
    if (!value) return '';
    return String(birthDateToYearsMonths(value).years);
  });
  const [approxMonths, setApproxMonths] = useState<string>(() => {
    if (!value) return '';
    return String(birthDateToYearsMonths(value).months);
  });

  const today = new Date();
  const todayIso = toIsoDate(today);
  const minDate = (() => {
    const d = new Date(today.getTime());
    d.setFullYear(d.getFullYear() - 30);
    return toIsoDate(d);
  })();

  const dateIso = value ? toIsoDate(value) : '';
  const describedBy = error ? errorId : undefined;

  function fireApproxChange(rawYears: string, rawMonths: string) {
    const y = rawYears === '' ? 0 : Math.min(Math.max(0, Number(rawYears) || 0), 30);
    const m = rawMonths === '' ? 0 : Math.min(Math.max(0, Number(rawMonths) || 0), 12);
    onChange(ageToBirthDate(y, m));
  }

  function handleYearsChange(raw: string) {
    setApproxYears(raw);
    fireApproxChange(raw, approxMonths);
  }

  function handleMonthsChange(raw: string) {
    setApproxMonths(raw);
    fireApproxChange(approxYears, raw);
  }

  function handleExactDateChange(raw: string) {
    if (raw === '') return;
    const parsed = parseIsoDate(raw);
    if (!parsed) return;
    onChange(parsed);
  }

  function handleModeChange(checked: boolean) {
    if (!checked && value) {
      const { years, months } = birthDateToYearsMonths(value);
      setApproxYears(String(years));
      setApproxMonths(String(months));
    }
    setIsExact(checked);
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle — segmented control */}
      <div
        id={toggleId}
        role="group"
        aria-label="Modo de entrada de idade"
        className="inline-flex rounded-lg border border-border bg-muted p-1 gap-1"
      >
        <button
          type="button"
          onClick={() => handleModeChange(false)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            !isExact
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Idade aproximada
        </button>
        <button
          type="button"
          onClick={() => handleModeChange(true)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            isExact
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Sei a data exata
        </button>
      </div>

      {!isExact ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={yearsId}>Anos</Label>
            <Input
              id={yearsId}
              type="number"
              min={0}
              max={30}
              step={1}
              value={approxYears}
              onChange={(e) => handleYearsChange(e.target.value)}
              aria-describedby={describedBy}
              aria-invalid={!!error || undefined}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={monthsId}>Meses</Label>
            <Input
              id={monthsId}
              type="number"
              min={0}
              max={12}
              step={1}
              value={approxMonths}
              onChange={(e) => handleMonthsChange(e.target.value)}
              aria-describedby={describedBy}
              aria-invalid={!!error || undefined}
              placeholder="0"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor={dateId}>Data de nascimento</Label>
          <Input
            id={dateId}
            type="date"
            min={minDate}
            max={todayIso}
            value={dateIso}
            onChange={(e) => handleExactDateChange(e.target.value)}
            aria-describedby={describedBy}
            aria-invalid={!!error || undefined}
          />
        </div>
      )}

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
