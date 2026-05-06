'use client';

import React from 'react';
import { Check, Loader2, XCircle } from 'lucide-react';

export type ProgressSubStepState = 'pending' | 'in_progress' | 'done' | 'error';

export interface ProgressSubStepData {
  id?: string;
  label: string;
  state: ProgressSubStepState;
  errorMessage?: string;
}

export interface ProgressSubStepProps {
  state: ProgressSubStepState;
  label: string;
  errorMessage?: string;
}

const BRAND = '#4E8C75';
const NEUTRAL = '#9ca3af';
const DANGER = '#b91c1c';
const TEXT_DONE = '#1F2A1F';

function SubIcon({ state }: { state: ProgressSubStepState }) {
  if (state === 'done') {
    return <Check className="h-4 w-4" style={{ color: BRAND }} aria-hidden="true" />;
  }
  if (state === 'in_progress') {
    return (
      <Loader2
        className="h-4 w-4 animate-spin"
        style={{ color: BRAND }}
        aria-hidden="true"
      />
    );
  }
  if (state === 'error') {
    return <XCircle className="h-4 w-4" style={{ color: DANGER }} aria-hidden="true" />;
  }
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3 w-3 rounded-full border"
      style={{ borderColor: NEUTRAL }}
    />
  );
}

export function ProgressSubStep({
  state,
  label,
  errorMessage,
}: ProgressSubStepProps) {
  const liveMode = state === 'error' ? 'assertive' : 'polite';
  const labelColor =
    state === 'error'
      ? DANGER
      : state === 'pending'
        ? NEUTRAL
        : state === 'done'
          ? TEXT_DONE
          : BRAND;

  const liveProps =
    state === 'in_progress' || state === 'error'
      ? { role: 'status' as const, 'aria-live': liveMode as 'polite' | 'assertive' }
      : {};

  return (
    <li className="flex items-start gap-2" {...liveProps}>
      <span className="mt-0.5 flex h-4 w-4 items-center justify-center" aria-hidden="true">
        <SubIcon state={state} />
      </span>
      <div className="flex-1">
        <p
          className="text-xs leading-snug"
          style={{
            color: labelColor,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {label}
        </p>
        {state === 'error' && errorMessage && (
          <p
            className="mt-0.5 text-[11px]"
            style={{ color: DANGER, fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {errorMessage}
          </p>
        )}
      </div>
    </li>
  );
}
