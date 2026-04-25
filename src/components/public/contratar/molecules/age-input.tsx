'use client';

import { useId, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgeUnit = 'anos' | 'meses';
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
 * Convert an approximate age (number + unit) into a `birthDate` by subtracting
 * the equivalent number of months from `today`.
 *
 * Note: JavaScript's `setMonth` overflow is acceptable for an approximate age
 * (PRD).
 */
export function ageToBirthDate(value: number, unit: AgeUnit, today: Date = new Date()): Date {
  const totalMonths = unit === 'anos' ? value * 12 : value;
  const d = new Date(today.getTime());
  d.setMonth(d.getMonth() - totalMonths);
  return d;
}

/**
 * Derive a "natural" approximate display from a `birthDate`.
 *
 * Rules:
 * - >= 24 months → return floor(years) in `anos`
 * - < 24 months → return floor(months) in `meses`
 * - < 1 month → returns `{ value: 0, unit: 'meses' }`
 */
export function birthDateToApproximate(
  birth: Date,
  today: Date = new Date(),
): { value: number; unit: AgeUnit } {
  const totalMonths = monthsBetween(birth, today);
  if (totalMonths < 1) {
    return { value: 0, unit: 'meses' };
  }
  if (totalMonths >= 24) {
    return { value: Math.floor(totalMonths / 12), unit: 'anos' };
  }
  return { value: totalMonths, unit: 'meses' };
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
  const numberId = `${baseId}-number`;
  const unitId = `${baseId}-unit`;
  const dateId = `${baseId}-date`;
  const errorId = `${baseId}-error`;

  const [mode, setMode] = useState<AgeMode>('approximate');

  // Derive the approximate representation from `value` whenever in approximate
  // mode. We keep local controlled state for the number+unit pair so the user
  // can type "0" / clear input without losing focus.
  const initialApprox = useMemo(() => {
    if (value) return birthDateToApproximate(value);
    return { value: 0, unit: 'anos' as AgeUnit };
  }, [value]);

  const [approxValue, setApproxValue] = useState<string>(
    value ? String(initialApprox.value) : '',
  );
  const [approxUnit, setApproxUnit] = useState<AgeUnit>(initialApprox.unit);

  const max = approxUnit === 'meses' ? 360 : 30;

  const today = useMemo(() => new Date(), []);
  const todayIso = toIsoDate(today);
  const minDate = useMemo(() => {
    const d = new Date(today.getTime());
    d.setFullYear(d.getFullYear() - 30);
    return toIsoDate(d);
  }, [today]);

  const dateIso = value ? toIsoDate(value) : '';

  function handleApproxValueChange(raw: string) {
    setApproxValue(raw);
    if (raw === '') return;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return;
    const clamped = Math.min(n, approxUnit === 'meses' ? 360 : 30);
    onChange(ageToBirthDate(clamped, approxUnit));
  }

  function handleApproxUnitChange(unit: AgeUnit) {
    setApproxUnit(unit);
    if (approxValue === '') return;
    const n = Number(approxValue);
    if (!Number.isFinite(n) || n < 0) return;
    const clamped = Math.min(n, unit === 'meses' ? 360 : 30);
    onChange(ageToBirthDate(clamped, unit));
  }

  function handleExactDateChange(raw: string) {
    if (raw === '') return;
    const parsed = parseIsoDate(raw);
    if (!parsed) return;
    onChange(parsed);
  }

  function switchToExact() {
    setMode('exact');
    // value remains canonical, no conversion needed
  }

  function switchToApproximate() {
    setMode('approximate');
    if (value) {
      const { value: v, unit } = birthDateToApproximate(value);
      setApproxValue(String(v));
      setApproxUnit(unit);
    }
  }

  const describedBy = error ? errorId : undefined;

  return (
    <div className="space-y-2">
      {mode === 'approximate' ? (
        <>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="space-y-1.5">
              <Label htmlFor={numberId}>Idade aproximada</Label>
              <Input
                id={numberId}
                type="number"
                min={0}
                max={max}
                step={1}
                value={approxValue}
                onChange={(e) => handleApproxValueChange(e.target.value)}
                aria-describedby={describedBy}
                aria-invalid={!!error || undefined}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={unitId}>Unidade</Label>
              <select
                id={unitId}
                value={approxUnit}
                onChange={(e) => handleApproxUnitChange(e.target.value as AgeUnit)}
                aria-describedby={describedBy}
                aria-invalid={!!error || undefined}
                className={cn(
                  'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75]',
                )}
              >
                <option value="anos">anos</option>
                <option value="meses">meses</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={switchToExact}
            className="text-sm font-medium text-[#4E8C75] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75] rounded"
          >
            Sei a data exata
          </button>
        </>
      ) : (
        <>
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
          <button
            type="button"
            onClick={switchToApproximate}
            className="text-sm font-medium text-[#4E8C75] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75] rounded"
          >
            Voltar para idade aproximada
          </button>
        </>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
