'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BenefitUsageForm,
  type BenefitUsageFormFieldErrors,
} from '@/components/admin/uso-beneficio/organisms/benefit-usage-form/BenefitUsageForm';
import type { PlanSummary } from '@/lib/types/plan';
import type {
  BenefitUsageResponse,
  CreateBenefitUsageInput,
} from '@/lib/types/benefit-usage';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface BenefitUsageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: PlanSummary;
  /** Invoked after the backend returns 201; receives the full usage payload. */
  onSuccess: (usage: BenefitUsageResponse) => void;
}

// ---------------------------------------------------------------------------
// Backend error mapping
// ---------------------------------------------------------------------------

interface ParsedBackendError {
  fieldErrors: BenefitUsageFormFieldErrors;
  topErrorMessage: string | null;
  /** Generic toast/message when no field-level mapping applies. */
  genericMessage: string | null;
}

interface BackendErrorBody {
  code?: string;
  message?: string | { code?: string; message?: string };
}

/**
 * Reads the structured error body emitted by the backend (proxied as-is by
 * the internal Route Handler) and maps known codes to UI surfaces:
 *
 * | Backend code                              | UI surface                |
 * | ----------------------------------------- | ------------------------- |
 * | BENEFIT_USAGE_ATTENDED_AT_OUT_OF_RANGE    | field error: attendedAt   |
 * | BENEFIT_USAGE_DISCOUNT_EXCEEDS_TOTAL      | field error: discount...  |
 * | BENEFIT_USAGE_PLAN_STATUS_INVALID         | top-level message         |
 * | anything else                             | generic message           |
 */
function parseBackendError(body: BackendErrorBody): ParsedBackendError {
  // Nest can wrap the structured body under `message` when using built-in
  // exceptions, so check both shapes.
  const flatCode = body.code;
  const nestedCode =
    typeof body.message === 'object' ? body.message?.code : undefined;
  const code = flatCode ?? nestedCode;

  const flatMessage =
    typeof body.message === 'string' ? body.message : undefined;
  const nestedMessage =
    typeof body.message === 'object' ? body.message?.message : undefined;
  const message = flatMessage ?? nestedMessage ?? null;

  switch (code) {
    case 'BENEFIT_USAGE_ATTENDED_AT_OUT_OF_RANGE':
      return {
        fieldErrors: {
          attendedAt:
            message ??
            'A data do atendimento está fora do intervalo permitido (até 7 dias retroativos).',
        },
        topErrorMessage: null,
        genericMessage: null,
      };
    case 'BENEFIT_USAGE_DISCOUNT_EXCEEDS_TOTAL':
      return {
        fieldErrors: {
          discountApplied:
            message ?? 'O desconto não pode ser maior que o valor total.',
        },
        topErrorMessage: null,
        genericMessage: null,
      };
    case 'BENEFIT_USAGE_PLAN_STATUS_INVALID':
      return {
        fieldErrors: {},
        topErrorMessage:
          message ??
          'Não é possível registrar uso para um plano com este status.',
        genericMessage: null,
      };
    default:
      return {
        fieldErrors: {},
        topErrorMessage: null,
        genericMessage:
          message ?? 'Não foi possível registrar o uso. Tente novamente.',
      };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Organism — `BenefitUsageModal`.
 *
 * Wraps `BenefitUsageForm` inside a shadcn `Dialog`. Owns the network call
 * to `POST /api/admin/benefit-usages` (internal Route Handler), the loading
 * state and the backend error mapping. On success it calls `onSuccess` with
 * the parsed `BenefitUsageResponse`, shows an inline confirmation banner and
 * closes the modal.
 */
export function BenefitUsageModal({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: BenefitUsageModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<BenefitUsageFormFieldErrors>(
    {},
  );
  const [topErrorMessage, setTopErrorMessage] = useState<string | null>(null);
  const [genericMessage, setGenericMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset transient state whenever the modal opens or closes so leftover
  // errors from the previous session do not bleed into the next one.
  useEffect(() => {
    if (open) {
      setFieldErrors({});
      setTopErrorMessage(null);
      setGenericMessage(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleCancel = useCallback(() => {
    if (isSubmitting) return;
    onOpenChange(false);
  }, [isSubmitting, onOpenChange]);

  const handleSubmit = useCallback(
    async (input: CreateBenefitUsageInput) => {
      setIsSubmitting(true);
      setFieldErrors({});
      setTopErrorMessage(null);
      setGenericMessage(null);
      setSuccessMessage(null);

      try {
        const res = await fetch('/api/admin/benefit-usages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!res.ok) {
          let body: BackendErrorBody = {};
          try {
            body = (await res.json()) as BackendErrorBody;
          } catch {
            body = {};
          }
          const parsed = parseBackendError(body);
          setFieldErrors(parsed.fieldErrors);
          setTopErrorMessage(parsed.topErrorMessage);
          setGenericMessage(parsed.genericMessage);
          return;
        }

        const usage = (await res.json()) as BenefitUsageResponse;
        // Success surface — both inline (no toast lib in repo today) and
        // via the parent callback.
        setSuccessMessage('Uso registrado.');
        onSuccess(usage);
        onOpenChange(false);
      } catch {
        setGenericMessage(
          'Erro de conexão ao registrar o uso. Verifique sua rede e tente novamente.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [onOpenChange, onSuccess],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Block close while submitting to avoid orphaned requests.
        if (!next && isSubmitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto"
        aria-describedby="benefit-usage-modal-description"
      >
        <DialogHeader>
          <DialogTitle>Registrar uso de benefício</DialogTitle>
          <DialogDescription id="benefit-usage-modal-description">
            Preencha os dados do atendimento. O registro fica vinculado ao
            plano atual e ao seu usuário.
          </DialogDescription>
        </DialogHeader>

        {/* Generic error banner (no toast util in the repo). */}
        {genericMessage && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive"
          >
            {genericMessage}
          </p>
        )}

        {/* Success banner — visible briefly until the modal closes. */}
        {successMessage && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {successMessage}
          </p>
        )}

        <BenefitUsageForm
          plan={plan}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          topErrorMessage={topErrorMessage}
        />
      </DialogContent>
    </Dialog>
  );
}
