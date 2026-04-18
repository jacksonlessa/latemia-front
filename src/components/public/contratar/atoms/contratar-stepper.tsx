import { Check } from 'lucide-react';

export interface ContratarStepperProps {
  steps: string[];
  /** 0-based index of the currently active step. */
  current: number;
}

export function ContratarStepper({ steps, current }: ContratarStepperProps) {
  return (
    <nav aria-label="Progresso do formulário" className="w-full">
      <ol className="flex items-start">
        {steps.map((label, index) => {
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
    </nav>
  );
}
