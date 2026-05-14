'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ChangeEvent, ClipboardEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Props consumed by the organism. The state machine (cooldown timer,
 * loading state) is hoisted to the parent (`StepContrato`) so the panel
 * stays a thin, fully-controlled view component.
 */
export interface ContractOtpPanelProps {
  /**
   * Server-built phone mask (e.g. `(11) 9****-1234`). The frontend NEVER
   * builds this string from the raw phone — it is always echoed back from
   * the backend so we keep one source of truth.
   */
  phoneMasked: string;

  /**
   * Number of seconds remaining on the resend cooldown. The button is
   * disabled while `cooldownSeconds > 0`. The parent ticks this value
   * down with a 1s `setInterval`.
   */
  cooldownSeconds: number;

  /**
   * Invoked when the user submits the 6-digit code (auto-submit on the
   * sixth digit or click on the "Verificar" button). The parent runs the
   * verify use-case and resolves/rejects accordingly.
   */
  onSubmit: (code: string) => Promise<void>;

  /**
   * Invoked when the user clicks "Reenviar código". The parent runs the
   * resend use-case. The component does not pre-disable the button on
   * `cooldownSeconds === 0` clicks — the parent is the source of truth.
   */
  onResend: () => Promise<void>;

  /**
   * Human-readable error message in pt-BR (already mapped by the parent
   * from a backend error code). When present, rendered with `role="alert"`
   * and the input gets `aria-invalid="true"`. UX rule: digits are NOT
   * zeroed on error — the user can review what they typed.
   */
  errorMessage?: string;

  /**
   * When true, both the input and the resend button are disabled. The
   * parent flips this to true while an OTP request/verify call is
   * in-flight.
   */
  busy?: boolean;
}

/**
 * Imperative API for parents that need to clear the input after a
 * successful resend.
 */
export interface ContractOtpPanelHandle {
  clear: () => void;
  focus: () => void;
}

const INPUT_ID = 'contract-otp-code';
const ERROR_ID = 'contract-otp-error';
const HELPER_ID = 'contract-otp-helper';
const OTP_LENGTH = 6;
const DIGITS_ONLY = /\D/g;

function sanitiseCode(raw: string): string {
  return raw.replace(DIGITS_ONLY, '').slice(0, OTP_LENGTH);
}

/**
 * ContractOtpPanel — overlay rendered by `StepContrato` when the OTP flag
 * is on. Implements WCAG AA accessibility:
 *
 *   - `inputMode="numeric"` for mobile keypads
 *   - `autoComplete="one-time-code"` for iOS/Android SMS auto-fill
 *   - `aria-label` on the input, `aria-describedby` linking the helper and
 *     error
 *   - Error block uses `role="alert"` so screen readers announce it
 *   - Auto-focus on mount so the user can start typing immediately
 *   - Native paste support: pasting `123456` into the field fills all six
 *     digits in one shot (no per-digit splitting needed — single input)
 */
export const ContractOtpPanel = forwardRef<
  ContractOtpPanelHandle,
  ContractOtpPanelProps
>(function ContractOtpPanel(
  { phoneMasked, cooldownSeconds, onSubmit, onResend, errorMessage, busy },
  ref,
) {
  const [code, setCode] = useState('');
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // -- Auto-focus on mount (a11y) -------------------------------------------
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // -- Imperative handle for the parent --------------------------------------
  useImperativeHandle(
    ref,
    () => ({
      clear: () => {
        setCode('');
        setSubmittingFor(null);
        inputRef.current?.focus();
      },
      focus: () => {
        inputRef.current?.focus();
      },
    }),
    [],
  );

  // -- Submission ------------------------------------------------------------
  const runSubmit = useCallback(
    async (value: string): Promise<void> => {
      if (value.length !== OTP_LENGTH) return;
      // Guard against duplicate submissions for the same code (e.g. auto-submit
      // on 6th digit + manual click). Re-allow retry once the value changes
      // (e.g. user edits after an OTP_INVALID error).
      if (submittingFor === value) return;
      setSubmittingFor(value);
      try {
        await onSubmit(value);
      } finally {
        // Keep `submittingFor` set so we don't re-fire while the same code
        // is in the input (UX rule: do NOT zero the input on error). It is
        // reset when the user types a different value.
      }
    },
    [onSubmit, submittingFor],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = sanitiseCode(event.target.value);
    setCode(next);
    if (next !== submittingFor) {
      setSubmittingFor(null);
    }
    if (next.length === OTP_LENGTH && !busy) {
      // Auto-submit when the user reaches 6 digits — matches the native
      // SMS auto-fill UX on iOS/Android.
      void runSubmit(next);
    }
  };

  // Defensive paste handler — sanitises *before* the change handler in case
  // the user pastes something like `123 456` or `123-456`.
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
    const pasted = event.clipboardData.getData('text');
    const sanitised = sanitiseCode(pasted);
    if (sanitised.length === 0) return;
    event.preventDefault();
    setCode(sanitised);
    setSubmittingFor(null);
    if (sanitised.length === OTP_LENGTH && !busy) {
      void runSubmit(sanitised);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void runSubmit(code);
  };

  const handleResend = (): void => {
    if (cooldownSeconds > 0 || busy) return;
    void onResend();
  };

  const canResend = cooldownSeconds === 0 && !busy;
  const canSubmit = code.length === OTP_LENGTH && !busy;

  return (
    <section
      aria-labelledby="contract-otp-heading"
      className="space-y-5 rounded-lg border border-border bg-card p-5"
      data-testid="contract-otp-panel"
    >
      <header className="space-y-1">
        <h3
          id="contract-otp-heading"
          className="text-base font-medium text-foreground"
        >
          Confirme com o código que enviamos
        </h3>
        <p id={HELPER_ID} className="text-sm text-muted-foreground">
          Enviamos um código de 6 dígitos para{' '}
          <span className="font-medium text-foreground">{phoneMasked}</span>.
          Pode levar alguns segundos.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleFormSubmit} noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor={INPUT_ID}
            className="block text-sm font-medium text-foreground"
          >
            Código de 6 dígitos
          </label>
          <Input
            id={INPUT_ID}
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Código de 6 dígitos"
            aria-describedby={
              errorMessage ? `${HELPER_ID} ${ERROR_ID}` : HELPER_ID
            }
            aria-invalid={errorMessage ? true : undefined}
            maxLength={OTP_LENGTH}
            value={code}
            onChange={handleChange}
            onPaste={handlePaste}
            disabled={busy}
            className={cn(
              'text-center text-lg tracking-[0.5em] font-mono',
              errorMessage && 'border-destructive focus-visible:ring-destructive',
            )}
            // The visible mask string is server-built; the user never sees
            // their raw phone here.
            placeholder="••••••"
          />
          {errorMessage ? (
            <p
              id={ERROR_ID}
              role="alert"
              aria-live="assertive"
              className="text-sm text-destructive"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="link"
            onClick={handleResend}
            disabled={!canResend}
            className="px-0 text-sm"
            aria-disabled={!canResend}
          >
            {cooldownSeconds > 0
              ? `Reenviar código em ${cooldownSeconds}s`
              : 'Reenviar código'}
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="bg-[#4E8C75] hover:bg-[#3d7260] text-white"
          >
            {busy ? 'Verificando…' : 'Verificar código'}
          </Button>
        </div>
      </form>
    </section>
  );
});
