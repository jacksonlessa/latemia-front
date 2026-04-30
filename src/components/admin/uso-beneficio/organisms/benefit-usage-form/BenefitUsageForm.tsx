'use client';

import { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MoneyInput } from '@/components/admin/planos-assinatura/atoms/money-input/MoneyInput';
import { PlanStatusAlert } from '@/components/admin/uso-beneficio/molecules/plan-status-alert/PlanStatusAlert';
import { cn } from '@/lib/utils';
import type { PlanSummary } from '@/lib/types/plan';
import type {
  BenefitUsageResponse,
  CreateBenefitUsageInput,
  UpdateBenefitUsageInput,
} from '@/lib/types/benefit-usage';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Field-level errors keyed by the form input name. The keys match the
 * fields rendered by this organism and are used both for inline display
 * and to surface backend error mapping (e.g. 422 codes).
 */
export interface BenefitUsageFormFieldErrors {
  attendedAt?: string;
  procedureDescription?: string;
  totalValue?: string;
  discountApplied?: string;
}

/** Mode hint passed by the parent — controls payload shape and submit label. */
export type BenefitUsageFormMode = 'create' | 'edit';

/**
 * Discriminated submit handler:
 * - `create` mode → receives `CreateBenefitUsageInput` (with `planId`).
 * - `edit` mode → receives `UpdateBenefitUsageInput` (no `planId`).
 *
 * The form handles both shapes via a single union; the parent picks the
 * matching variant when narrowing on `mode`.
 */
export type BenefitUsageFormSubmit =
  | ((input: CreateBenefitUsageInput) => Promise<void>)
  | ((input: UpdateBenefitUsageInput) => Promise<void>);

export interface BenefitUsageFormProps {
  /** Plan context — used to render pet/status header and the status alert. */
  plan: PlanSummary;
  /**
   * Submission mode. Defaults to `create` to preserve the existing call sites.
   * When `edit`, the submit payload omits `planId` and the action label changes.
   */
  mode?: BenefitUsageFormMode;
  /**
   * Pre-fills the form fields. Required (in practice) when `mode === 'edit'`;
   * ignored when `mode === 'create'`.
   */
  initialValues?: BenefitUsageResponse;
  /**
   * Resolves on success. The shape passed in depends on `mode`:
   * `create` → `CreateBenefitUsageInput`; `edit` → `UpdateBenefitUsageInput`.
   */
  onSubmit: BenefitUsageFormSubmit;
  onCancel: () => void;
  /** Disables fields and submit button while the parent runs the request. */
  isSubmitting?: boolean;
  /** Backend-mapped errors injected per-field by the parent (modal). */
  fieldErrors?: BenefitUsageFormFieldErrors;
  /** Top-level error message shown above the form (e.g. PLAN_STATUS_INVALID). */
  topErrorMessage?: string | null;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_DESCRIPTION_LENGTH = 3;
const MAX_DESCRIPTION_LENGTH = 255;
const RETROACTIVE_WINDOW_DAYS = 7;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a `Date` as the value expected by `<input type="datetime-local">`,
 * i.e. `YYYY-MM-DDTHH:mm`, in the LOCAL timezone (no `Z` suffix).
 */
function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * Converts a `<input type="datetime-local">` value (interpreted as local
 * wall-clock time) into an ISO 8601 string in UTC for the API.
 */
function datetimeLocalToIso(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

/** Converts integer cents to a decimal string with two fractional digits. */
function centsToDecimalString(cents: number): string {
  if (!Number.isFinite(cents) || cents < 0) return '0.00';
  return (cents / 100).toFixed(2);
}

/**
 * Parses a Decimal string emitted by the backend (e.g. `"1234.56"`) into
 * integer cents to feed the `MoneyInput` atom. Falls back to `0` for invalid
 * input so the form remains usable instead of crashing on malformed data.
 */
function decimalStringToCents(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

/**
 * Converts an ISO 8601 timestamp from the backend into the value expected by
 * `<input type="datetime-local">` in the user's local timezone.
 */
function isoToDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return toDatetimeLocalValue(date);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface FormState {
  attendedAt: string; // datetime-local format
  procedureDescription: string;
  isEmergency: boolean;
  /** value in cents */
  totalValue: number;
  /** value in cents */
  discountApplied: number;
}

function buildInitialState(initial?: BenefitUsageResponse): FormState {
  if (initial) {
    return {
      attendedAt: isoToDatetimeLocalValue(initial.attendedAt),
      procedureDescription: initial.procedureDescription,
      isEmergency: initial.isEmergency,
      totalValue: decimalStringToCents(initial.totalValue),
      discountApplied: decimalStringToCents(initial.discountApplied),
    };
  }
  return {
    attendedAt: toDatetimeLocalValue(new Date()),
    procedureDescription: '',
    isEmergency: false,
    totalValue: 0,
    discountApplied: 0,
  };
}

/**
 * Organism — `BenefitUsageForm`.
 *
 * Local state-driven form (no react-hook-form) mirroring the existing
 * `PlanForm`. Renders the plan-status banner at the top and validates the
 * payload before delegating to `onSubmit`.
 *
 * The parent (`BenefitUsageModal`) is responsible for the network call and
 * for mapping backend errors into `fieldErrors`/`topErrorMessage`.
 */
export function BenefitUsageForm({
  plan,
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  fieldErrors,
  topErrorMessage,
  className,
}: BenefitUsageFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(initialValues),
  );
  const [localErrors, setLocalErrors] = useState<BenefitUsageFormFieldErrors>(
    {},
  );

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setLocalErrors((prev) => {
        if (!(key in prev)) return prev;
        // Clear the inline error for the field being edited.
        const next = { ...prev };
        delete next[key as keyof BenefitUsageFormFieldErrors];
        return next;
      });
    },
    [],
  );

  // Re-compute the [now-7d, now] bounds on every render so the user cannot
  // pick a future moment while the modal is open.
  const { minAttendedAt, maxAttendedAt } = useMemo(() => {
    const now = new Date();
    const min = new Date(now);
    min.setDate(min.getDate() - RETROACTIVE_WINDOW_DAYS);
    return {
      minAttendedAt: toDatetimeLocalValue(min),
      maxAttendedAt: toDatetimeLocalValue(now),
    };
  }, []);

  function validate(state: FormState): BenefitUsageFormFieldErrors {
    const errors: BenefitUsageFormFieldErrors = {};

    // attendedAt
    if (!state.attendedAt) {
      errors.attendedAt = 'Informe a data e hora do atendimento.';
    } else {
      const picked = new Date(state.attendedAt);
      if (Number.isNaN(picked.getTime())) {
        errors.attendedAt = 'Data/hora inválida.';
      } else {
        const now = new Date();
        const min = new Date(now);
        min.setDate(min.getDate() - RETROACTIVE_WINDOW_DAYS);
        if (picked.getTime() > now.getTime()) {
          errors.attendedAt =
            'A data do atendimento não pode estar no futuro.';
        } else if (picked.getTime() < min.getTime()) {
          errors.attendedAt = `A data do atendimento não pode ser anterior a ${RETROACTIVE_WINDOW_DAYS} dias atrás.`;
        }
      }
    }

    // procedureDescription
    const trimmed = state.procedureDescription.trim();
    if (trimmed.length < MIN_DESCRIPTION_LENGTH) {
      errors.procedureDescription = `Descreva o procedimento com pelo menos ${MIN_DESCRIPTION_LENGTH} caracteres.`;
    } else if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
      errors.procedureDescription = `A descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`;
    }

    // totalValue
    if (state.totalValue <= 0) {
      errors.totalValue = 'Informe o valor total do procedimento.';
    }

    // discountApplied
    if (state.discountApplied < 0) {
      errors.discountApplied = 'O desconto não pode ser negativo.';
    } else if (state.discountApplied > state.totalValue) {
      errors.discountApplied =
        'O desconto não pode ser maior que o valor total.';
    }

    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }
    setLocalErrors({});

    if (mode === 'edit') {
      // PATCH payload — `planId` is intentionally omitted (the backend rejects
      // attempts to change the linked plan). All editable fields are sent.
      const payload: UpdateBenefitUsageInput = {
        attendedAt: datetimeLocalToIso(form.attendedAt),
        procedureDescription: form.procedureDescription.trim(),
        isEmergency: form.isEmergency,
        totalValue: centsToDecimalString(form.totalValue),
        discountApplied: centsToDecimalString(form.discountApplied),
      };
      await (onSubmit as (input: UpdateBenefitUsageInput) => Promise<void>)(
        payload,
      );
      return;
    }

    const payload: CreateBenefitUsageInput = {
      planId: plan.id,
      attendedAt: datetimeLocalToIso(form.attendedAt),
      procedureDescription: form.procedureDescription.trim(),
      isEmergency: form.isEmergency,
      totalValue: centsToDecimalString(form.totalValue),
      discountApplied: centsToDecimalString(form.discountApplied),
    };

    await (onSubmit as (input: CreateBenefitUsageInput) => Promise<void>)(
      payload,
    );
  }

  // Combine local validation errors with backend-mapped ones; backend wins
  // because they reflect the latest server response.
  const effectiveErrors: BenefitUsageFormFieldErrors = {
    ...localErrors,
    ...(fieldErrors ?? {}),
  };

  const descriptionLength = form.procedureDescription.length;

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Registrar uso de benefício"
      className={cn('space-y-4', className)}
      noValidate
    >
      {/* Plan context header */}
      {(plan.petName || plan.clientName) && (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          {plan.petName && (
            <p className="font-medium text-[#2C2C2E]">Pet: {plan.petName}</p>
          )}
          {plan.clientName && (
            <p className="text-xs text-muted-foreground">
              Tutor: {plan.clientName}
            </p>
          )}
        </div>
      )}

      {/* Plan status alert (carencia / inadimplente) */}
      <PlanStatusAlert status={plan.status} />

      {/* Top-level error (e.g. PLAN_STATUS_INVALID) */}
      {topErrorMessage && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive"
        >
          {topErrorMessage}
        </p>
      )}

      {/* attendedAt */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="benefit-usage-attended-at">
          Data e hora do atendimento{' '}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <Input
          id="benefit-usage-attended-at"
          type="datetime-local"
          value={form.attendedAt}
          onChange={(e) => update('attendedAt', e.target.value)}
          min={minAttendedAt}
          max={maxAttendedAt}
          required
          disabled={isSubmitting}
          aria-invalid={Boolean(effectiveErrors.attendedAt)}
          aria-describedby={
            effectiveErrors.attendedAt
              ? 'benefit-usage-attended-at-error'
              : 'benefit-usage-attended-at-help'
          }
        />
        {effectiveErrors.attendedAt ? (
          <p
            id="benefit-usage-attended-at-error"
            role="alert"
            className="text-xs text-destructive"
          >
            {effectiveErrors.attendedAt}
          </p>
        ) : (
          <p
            id="benefit-usage-attended-at-help"
            className="text-xs text-muted-foreground"
          >
            Aceita até {RETROACTIVE_WINDOW_DAYS} dias retroativos. Não aceita
            datas futuras.
          </p>
        )}
      </div>

      {/* procedureDescription */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="benefit-usage-description">
          Descrição do procedimento{' '}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <textarea
          id="benefit-usage-description"
          value={form.procedureDescription}
          onChange={(e) => update('procedureDescription', e.target.value)}
          required
          disabled={isSubmitting}
          minLength={MIN_DESCRIPTION_LENGTH}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={3}
          placeholder="Ex.: Consulta clínica + vacinação V10"
          aria-invalid={Boolean(effectiveErrors.procedureDescription)}
          aria-describedby={
            effectiveErrors.procedureDescription
              ? 'benefit-usage-description-error'
              : 'benefit-usage-description-help'
          }
          className={cn(
            'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y',
          )}
        />
        {effectiveErrors.procedureDescription ? (
          <p
            id="benefit-usage-description-error"
            role="alert"
            className="text-xs text-destructive"
          >
            {effectiveErrors.procedureDescription}
          </p>
        ) : (
          <p
            id="benefit-usage-description-help"
            className="text-xs text-muted-foreground"
          >
            Entre {MIN_DESCRIPTION_LENGTH} e {MAX_DESCRIPTION_LENGTH}{' '}
            caracteres.{' '}
            <span className="font-mono">
              {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </p>
        )}
      </div>

      {/* isEmergency */}
      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
        <div className="flex flex-col">
          <Label htmlFor="benefit-usage-is-emergency" className="cursor-pointer">
            Atendimento de emergência?
          </Label>
          <span className="text-xs text-muted-foreground">
            Ative para diferenciar emergência coberta de descontos eletivos
            (ex.: vacinação).
          </span>
        </div>
        <Switch
          id="benefit-usage-is-emergency"
          checked={form.isEmergency}
          onCheckedChange={(checked) => update('isEmergency', checked)}
          disabled={isSubmitting}
          aria-label="Marcar como emergência"
        />
      </div>

      {/* Money fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <MoneyInput
            id="benefit-usage-total-value"
            label="Valor total (R$)"
            value={form.totalValue}
            onChange={(cents) => update('totalValue', cents)}
            disabled={isSubmitting}
            aria-describedby={
              effectiveErrors.totalValue
                ? 'benefit-usage-total-value-error'
                : undefined
            }
          />
          {effectiveErrors.totalValue && (
            <p
              id="benefit-usage-total-value-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {effectiveErrors.totalValue}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <MoneyInput
            id="benefit-usage-discount-applied"
            label="Desconto aplicado (R$)"
            value={form.discountApplied}
            onChange={(cents) => update('discountApplied', cents)}
            disabled={isSubmitting}
            aria-describedby={
              effectiveErrors.discountApplied
                ? 'benefit-usage-discount-applied-error'
                : undefined
            }
          />
          {effectiveErrors.discountApplied && (
            <p
              id="benefit-usage-discount-applied-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {effectiveErrors.discountApplied}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#4E8C75] hover:bg-[#3d7060] text-white"
          aria-live="polite"
        >
          {mode === 'edit'
            ? isSubmitting
              ? 'Salvando...'
              : 'Salvar alterações'
            : isSubmitting
              ? 'Registrando...'
              : 'Registrar uso'}
        </Button>
      </div>
    </form>
  );
}
