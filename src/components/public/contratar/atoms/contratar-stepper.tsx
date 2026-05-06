import React from 'react';
import { Check } from 'lucide-react';

export interface StepMeta {
  label: string;
  title: React.ReactNode;
  helper: string;
}

export interface ContratarStepperProps {
  steps: StepMeta[];
  /** 0-based index of the currently active step. */
  current: number;
}

export function ContratarStepper({ steps, current }: ContratarStepperProps) {
  const active = steps[current];

  return (
    <nav aria-label="Progresso do formulário" className="w-full space-y-4">
      <ol className="flex items-start">
        {steps.map(({ label }, index) => {
          const isCompleted = index < current;
          const isActive = index === current;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={label}
              className={`flex items-start${isLast ? '' : ' flex-1'}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors"
                  style={
                    isCompleted
                      ? { backgroundColor: '#4E8C75', borderColor: '#4E8C75', color: '#fff' }
                      : isActive
                        ? { backgroundColor: '#4E8C75', borderColor: '#4E8C75', color: '#fff' }
                        : { backgroundColor: '#fff', borderColor: '#d1d5db', color: '#9ca3af' }
                  }
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className="max-w-[72px] text-center text-xs font-medium leading-tight"
                  style={
                    isCompleted || isActive
                      ? { color: '#4E8C75' }
                      : { color: '#9ca3af' }
                  }
                >
                  {label}
                </span>
              </div>

              {/* Connector line between steps */}
              {!isLast && (
                <div
                  className="mt-4 h-0.5 flex-1 transition-colors"
                  style={{ backgroundColor: isCompleted ? '#4E8C75' : '#e5e7eb' }}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Active step title + helper */}
      {active && (
        <div className="pt-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6E] mb-1">
            Passo {current + 1} de {steps.length}
          </p>
          <h2
            className="font-display font-normal"
            style={{ fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.6px', color: '#1F2A1F', margin: 0 }}
          >
            {active.title}
          </h2>
          {active.helper && (
            <p className="mt-1 text-sm text-[#6B6B6E]">{active.helper}</p>
          )}
        </div>
      )}
    </nav>
  );
}
