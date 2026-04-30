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
  UpdateBenefitUsageInput,
} from '@/lib/types/benefit-usage';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface EditUsageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Plan context for the form header / status alert. Pass the lightest
   * representation possible — only `id`, `status`, `petName`, `clientName` are
   * read by the form.
   */
  plan: PlanSummary;
  /** Current usage record being edited; pre-fills the form. */
  usage: BenefitUsageResponse;
  /**
   * Invoked after the backend returns 200; receives the updated payload.
   * The parent typically refreshes the list after this callback runs.
   */
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
 * Maps the backend `{ code, message }` envelope into UI surfaces. Mirrors
 * `BenefitUsageModal.parseBackendError` and adds the edit-specific code
 * `BENEFIT_USAGE_FORBIDDEN_FIELD` (defense-in-depth — the form already
 * omits `planId`, but a 403 is still possible if a future field is gated).
 */
function parseBackendError(body: BackendErrorBody): ParsedBackendError {
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
    case 'BENEFIT_USAGE_FORBIDDEN_FIELD':
      return {
        fieldErrors: {},
        topErrorMessage:
          message ?? 'Não é permitido alterar o plano vinculado ao registro.',
        genericMessage: null,
      };
    case 'BENEFIT_USAGE_NOT_FOUND':
      return {
        fieldErrors: {},
        topErrorMessage: null,
        genericMessage:
          message ?? 'Registro não encontrado. Atualize a página e tente novamente.',
      };
    default:
      return {
        fieldErrors: {},
        topErrorMessage: null,
        genericMessage:
          message ?? 'Não foi possível salvar as alterações. Tente novamente.',
      };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Organism — `EditUsageModal`.
 *
 * Admin-only counterpart of `BenefitUsageModal`. Wraps `BenefitUsageForm` in
 * `edit` mode inside a shadcn `Dialog`. Owns the network call to
 * `PATCH /api/admin/benefit-usages/:id` (internal Route Handler), the
 * loading state, and the backend error mapping. On success, calls
 * `onSuccess` with the updated payload and closes the modal.
 */
export function EditUsageModal({
  open,
  onOpenChange,
  plan,
  usage,
  onSuccess,
}: EditUsageModalProps) {
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
    async (input: UpdateBenefitUsageInput) => {
      setIsSubmitting(true);
      setFieldErrors({});
      setTopErrorMessage(null);
      setGenericMessage(null);
      setSuccessMessage(null);

      try {
        const res = await fetch(
          `/api/admin/benefit-usages/${encodeURIComponent(usage.id)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          },
        );

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

        const updated = (await res.json()) as BenefitUsageResponse;
        setSuccessMessage('Alterações salvas.');
        onSuccess(updated);
        onOpenChange(false);
      } catch {
        setGenericMessage(
          'Erro de conexão ao salvar as alterações. Verifique sua rede e tente novamente.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [usage.id, onOpenChange, onSuccess],
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
        aria-describedby="edit-usage-modal-description"
      >
        <DialogHeader>
          <DialogTitle>Editar uso de benefício</DialogTitle>
          <DialogDescription id="edit-usage-modal-description">
            Atualize os dados do atendimento. O plano vinculado e o
            responsável pelo registro original não podem ser alterados.
          </DialogDescription>
        </DialogHeader>

        {/* Generic error banner. */}
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
          mode="edit"
          initialValues={usage}
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
