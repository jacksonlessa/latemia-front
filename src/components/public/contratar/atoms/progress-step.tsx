'use client';

import React from 'react';
import { Check, Loader2, XCircle } from 'lucide-react';
import { ProgressSubStep, type ProgressSubStepData } from './progress-sub-step';

export type ProgressState = 'pending' | 'in_progress' | 'done' | 'error';

export interface ProgressStepProps {
  state: ProgressState;
  label: string;
  subSteps?: ProgressSubStepData[];
  errorMessage?: string;
}

const BRAND = '#4E8C75';
const NEUTRAL = '#9ca3af';
const DANGER = '#b91c1c';
const TEXT_DONE = '#1F2A1F';

function getColor(state: ProgressState): string {
  switch (state) {
    case 'done':
      return BRAND;
    case 'in_progress':
      return BRAND;
    case 'error':
      return DANGER;
    case 'pending':
    default:
      return NEUTRAL;
  }
}

function StateIcon({ state }: { state: ProgressState }) {
  const color = getColor(state);
  if (state === 'done') {
    return <Check className="h-5 w-5" style={{ color }} aria-hidden="true" />;
  }
  if (state === 'in_progress') {
    return (
      <Loader2 className="h-5 w-5 animate-spin" style={{ color }} aria-hidden="true" />
    );
  }
  if (state === 'error') {
    return <XCircle className="h-5 w-5" style={{ color }} aria-hidden="true" />;
  }
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 rounded-full border-2"
      style={{ borderColor: NEUTRAL }}
    />
  );
}

export function ProgressStep({
  state,
  label,
  subSteps,
  errorMessage,
}: ProgressStepProps) {
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
    <li className="space-y-2" {...liveProps}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-5 w-5 items-center justify-center" aria-hidden="true">
          <StateIcon state={state} />
        </span>
        <div className="flex-1">
          <p
            className="text-sm font-medium leading-snug"
            style={{
              color: labelColor,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {label}
          </p>
          {state === 'error' && errorMessage && (
            <p
              className="mt-1 text-xs"
              style={{ color: DANGER, fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {subSteps && subSteps.length > 0 && (
        <ul className="space-y-1.5 pl-8">
          {subSteps.map((sub) => (
            <ProgressSubStep
              key={sub.id ?? sub.label}
              state={sub.state}
              label={sub.label}
              errorMessage={sub.errorMessage}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
