'use client';

/**
 * AddPetToClientDialog — Organism
 *
 * Two-step wizard (`Dialog`, not `Sheet` — this is a progression flow, not a
 * point edit) that lets an admin/atendente add a new pet to a client's
 * existing Pagar.me subscription (`adicao-pet-cliente-existente`, F6/RF21-24).
 *
 * Step 1 ("form"): pet data — same fields/validation as `CreatePetDto`
 * (reuses the inputs/validation style of `EditPetDrawer` for visual
 * consistency with the rest of the admin).
 *
 * Step 2 ("confirm"): financial preview, additional-pet contract text, and
 * the mandatory "tutor está ciente" checkbox. Submits
 * `POST /api/admin/clients/:clientId/pets` with a stable `Idempotency-Key`
 * (generated once per dialog opening via `useRef`).
 *
 * Financial preview note: the amounts shown before submit are a LOCAL
 * estimate — `(currentLivePlanCount + 1) × pricePerPetCents` — computed from
 * data already available to the admin panel. The authoritative
 * `nextBillingAt`/`nextBillingAmountCents` are only known once the backend
 * responds (it reads them from the Pagar.me subscription after the item is
 * added — see TechSpec § "Decisões Principais"). Because the exact next
 * billing date is not known before submit, the coverage-start warning uses
 * generic wording ("a próxima cobrança") rather than a specific date; the
 * real date is available in `onAdded(result)` for the caller to surface if
 * needed (e.g. a follow-up toast), since `ClientDetail` does not currently
 * expose the subscription's `nextBillingAt` outside of this write path.
 *
 * Error handling:
 * - 422 CLIENT_NOT_ELIGIBLE_FOR_PET_ADDITION → banner mapped by `reason`.
 * - 409 INVALID_INPUT (name collision)       → inline error on the name
 *   field, back on step 1.
 * - 502 / network errors                      → generic banner with retry
 *   (same Idempotency-Key is reused).
 *
 * On success: closes the dialog and calls `onAdded(result)` — the parent is
 * responsible for `router.refresh()`.
 *
 * LGPD: request body contains pet data only (no client PII beyond what the
 * admin already has access to); forwarded server-side only, never logged.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MarkdownProse } from '@/components/ui/markdown-prose';
import { formatBRL } from '@/lib/currency';
import type { PetSpecies, PetSex, AddPetToClientResult } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AddPetToClientDialogProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the backend confirms the pet was added. */
  onAdded: (result: AddPetToClientResult) => void;
  /**
   * Number of currently "live" (non-terminal) plans for this client — used
   * to compute the local financial preview
   * `(currentLivePlanCount + 1) × pricePerPetCents`.
   */
  currentLivePlanCount: number;
  /** Current subscription price per pet, in cents. */
  pricePerPetCents: number;
  /**
   * Additional-pet contract text (`SystemSetting.pet_addition_contract_text`).
   * Fetched server-side by the parent page (`GET /v1/settings` is
   * admin-only on the backend) — empty string falls back to a generic
   * placeholder message.
   */
  contractText: string;
  /**
   * Storybook/test-only: renders the dialog already on a given step when it
   * opens, instead of always starting at `'form'`. Never used in production
   * call sites.
   */
  initialStep?: WizardStep;
  /**
   * Storybook/test-only: prefills step 1 field values (merged over the
   * empty defaults) when the dialog opens. Never used in production call
   * sites.
   */
  initialValues?: Partial<FormValues>;
  /**
   * Storybook-only: freezes the submitting state (loading button) without
   * requiring an actual fetch — same pattern as
   * `PaymentUpdateLinkSection`'s `isLoading` prop.
   */
  isSubmittingOverride?: boolean;
}

export type WizardStep = 'form' | 'confirm';

export interface FormValues {
  name: string;
  species: PetSpecies;
  breed: string;
  weight: string; // string to allow controlled input; converted on submit
  birthDate: string; // YYYY-MM-DD for <input type="date">
  castrated: boolean;
  sex: PetSex;
}

interface FieldErrors {
  name?: string;
  breed?: string;
  weight?: string;
  birthDate?: string;
  _form?: string;
}

const EMPTY_VALUES: FormValues = {
  name: '',
  species: 'canino',
  breed: '',
  weight: '',
  birthDate: '',
  castrated: false,
  sex: 'male',
};

const BLOCKED_REASON_MESSAGES: Record<string, string> = {
  client_inadimplente:
    'Cliente com cobrança em aberto. Use o link de atualização de pagamento primeiro.',
  client_pendente:
    'Aguarde a primeira cobrança ser confirmada antes de adicionar pets.',
  client_no_subscription: 'Este cliente não possui uma assinatura ativa.',
};

const DEFAULT_CONTRACT_TEXT =
  'O pet passa a integrar a assinatura já existente do tutor. A próxima fatura ' +
  'consolidada é atualizada automaticamente para incluir o novo pet, e a ' +
  'cobertura desse pet começa apenas quando essa fatura é paga — não há ' +
  'cobrança avulsa no momento da adição.';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateStep1(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Nome é obrigatório.';
  }

  if (!values.breed.trim()) {
    errors.breed = 'Raça é obrigatória.';
  }

  const weightNum = parseFloat(values.weight);
  if (values.weight === '' || isNaN(weightNum) || weightNum < 0.1 || weightNum > 100) {
    errors.weight = 'Peso deve estar entre 0,1 e 100 kg.';
  }

  if (!values.birthDate) {
    errors.birthDate = 'Data de nascimento é obrigatória.';
  } else {
    const parsed = new Date(values.birthDate);
    if (isNaN(parsed.getTime())) {
      errors.birthDate = 'Data inválida.';
    } else if (parsed >= new Date()) {
      errors.birthDate = 'A data de nascimento deve estar no passado.';
    }
  }

  return errors;
}

function isDirty(values: FormValues): boolean {
  return (Object.keys(EMPTY_VALUES) as (keyof FormValues)[]).some(
    (k) => values[k] !== EMPTY_VALUES[k],
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddPetToClientDialog({
  clientId,
  open,
  onOpenChange,
  onAdded,
  currentLivePlanCount,
  pricePerPetCents,
  contractText,
  initialStep,
  initialValues,
  isSubmittingOverride,
}: AddPetToClientDialogProps) {
  const [step, setStep] = useState<WizardStep>(initialStep ?? 'form');
  const [values, setValues] = useState<FormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [tutorAcknowledged, setTutorAcknowledged] = useState(false);
  const [genericError, setGenericError] = useState<string | null>(null);
  const [isSubmittingInternal, setIsSubmitting] = useState(false);
  const isSubmitting = isSubmittingOverride ?? isSubmittingInternal;

  const nameInputRef = useRef<HTMLInputElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Idempotency-Key: generated once per dialog opening, persisted across
  // retries within the same opening so a resubmit after a 502/network error
  // never duplicates the operation on the backend.
  const idempotencyKeyRef = useRef<string>('');

  // Reset all local state and generate a fresh Idempotency-Key every time
  // the dialog opens.
  useEffect(() => {
    if (open) {
      idempotencyKeyRef.current = crypto.randomUUID();
      setStep(initialStep ?? 'form');
      setValues({ ...EMPTY_VALUES, ...initialValues });
      setFieldErrors({});
      setTutorAcknowledged(false);
      setGenericError(null);
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialStep/initialValues are Storybook/test-only fixtures, not expected to change across renders while open
  }, [open]);

  // Focus management: move focus to the first field of the active step.
  useEffect(() => {
    if (!open) return;
    if (step === 'form') {
      nameInputRef.current?.focus();
    } else {
      checkboxRef.current?.focus();
    }
  }, [open, step]);

  function handleChange(field: keyof FormValues, value: string | boolean): void {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (typeof value === 'string' && fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FieldErrors];
        return next;
      });
    }
  }

  function requestClose(): void {
    if (isSubmitting) return;
    if (step === 'confirm' || isDirty(values)) {
      const confirmed = window.confirm(
        'Há dados preenchidos que serão perdidos. Deseja fechar mesmo assim?',
      );
      if (!confirmed) return;
    }
    onOpenChange(false);
  }

  function handleContinue(): void {
    const errors = validateStep1(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setGenericError(null);
    setStep('confirm');
  }

  async function handleSubmit(): Promise<void> {
    if (!tutorAcknowledged || isSubmitting) return;

    setIsSubmitting(true);
    setGenericError(null);

    try {
      const payload = {
        name: values.name.trim(),
        species: values.species,
        breed: values.breed.trim(),
        weight: parseFloat(values.weight),
        birthDate: new Date(values.birthDate).toISOString(),
        castrated: values.castrated,
        sex: values.sex,
        tutorAcknowledged: true,
      };

      const res = await fetch(`/api/admin/clients/${encodeURIComponent(clientId)}/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = (await res.json()) as AddPetToClientResult;
        onAdded(result);
        onOpenChange(false);
        return;
      }

      let body: { code?: string; reason?: string; message?: string } = {};
      try {
        body = (await res.json()) as typeof body;
      } catch {
        // non-JSON body
      }

      if (res.status === 422 && body.reason) {
        setGenericError(
          BLOCKED_REASON_MESSAGES[body.reason] ??
            'Cliente não elegível para adição de pet no momento.',
        );
        return;
      }

      if (res.status === 409) {
        setStep('form');
        setFieldErrors({
          name: body.message ?? 'Já existe um pet com esse nome para este cliente.',
        });
        return;
      }

      if (res.status === 400) {
        setGenericError(body.message ?? 'Verifique os dados informados.');
        return;
      }

      // 502 / other upstream failures — generic banner, retry keeps the key.
      setGenericError(
        body.message ?? 'Ocorreu um erro ao processar a solicitação. Tente novamente.',
      );
    } catch {
      setGenericError('Erro de conexão. Verifique sua rede e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentAmountCents = currentLivePlanCount * pricePerPetCents;
  const newAmountCents = (currentLivePlanCount + 1) * pricePerPetCents;
  const displayedContractText = contractText.trim() || DEFAULT_CONTRACT_TEXT;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          requestClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent
        className="max-w-lg"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            requestClose();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Adicionar pet</DialogTitle>
          <DialogDescription>
            {step === 'form'
              ? 'Passo 1 de 2 — dados do pet.'
              : 'Passo 2 de 2 — confirmação.'}
          </DialogDescription>
        </DialogHeader>

        {genericError && (
          <p
            role="alert"
            id="add-pet-generic-error"
            className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive"
          >
            {genericError}
          </p>
        )}

        {step === 'form' ? (
          <form
            id="add-pet-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleContinue();
            }}
            noValidate
            className="space-y-5"
          >
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="add-pet-name" className="text-sm font-medium text-foreground">
                Nome <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <Input
                id="add-pet-name"
                ref={nameInputRef}
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                aria-required="true"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'add-pet-name-error' : undefined}
                disabled={isSubmitting}
                autoComplete="off"
              />
              {fieldErrors.name && (
                <p id="add-pet-name-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Species */}
            <div className="space-y-1.5">
              <label htmlFor="add-pet-species" className="text-sm font-medium text-foreground">
                Espécie
              </label>
              <Select
                value={values.species}
                onValueChange={(v) => handleChange('species', v)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="add-pet-species" aria-label="Espécie do pet">
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="canino">Canino</SelectItem>
                  <SelectItem value="felino">Felino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Breed */}
            <div className="space-y-1.5">
              <label htmlFor="add-pet-breed" className="text-sm font-medium text-foreground">
                Raça <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <Input
                id="add-pet-breed"
                value={values.breed}
                onChange={(e) => handleChange('breed', e.target.value)}
                aria-invalid={!!fieldErrors.breed}
                aria-describedby={fieldErrors.breed ? 'add-pet-breed-error' : undefined}
                disabled={isSubmitting}
                autoComplete="off"
              />
              {fieldErrors.breed && (
                <p id="add-pet-breed-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.breed}
                </p>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label htmlFor="add-pet-weight" className="text-sm font-medium text-foreground">
                Peso (kg) <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <Input
                id="add-pet-weight"
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={values.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                aria-invalid={!!fieldErrors.weight}
                aria-describedby={fieldErrors.weight ? 'add-pet-weight-error' : undefined}
                disabled={isSubmitting}
              />
              {fieldErrors.weight && (
                <p id="add-pet-weight-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.weight}
                </p>
              )}
            </div>

            {/* Birth date */}
            <div className="space-y-1.5">
              <label htmlFor="add-pet-birthDate" className="text-sm font-medium text-foreground">
                Data de nascimento{' '}
                <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <Input
                id="add-pet-birthDate"
                type="date"
                value={values.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                aria-invalid={!!fieldErrors.birthDate}
                aria-describedby={
                  fieldErrors.birthDate ? 'add-pet-birthDate-error' : undefined
                }
                disabled={isSubmitting}
                max={new Date().toISOString().slice(0, 10)}
              />
              {fieldErrors.birthDate && (
                <p id="add-pet-birthDate-error" role="alert" className="text-xs text-destructive">
                  {fieldErrors.birthDate}
                </p>
              )}
            </div>

            {/* Sex */}
            <div className="space-y-1.5">
              <label htmlFor="add-pet-sex" className="text-sm font-medium text-foreground">
                Sexo
              </label>
              <Select
                value={values.sex}
                onValueChange={(v) => handleChange('sex', v)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="add-pet-sex" aria-label="Sexo do pet">
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Macho</SelectItem>
                  <SelectItem value="female">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Castrated */}
            <div className="flex items-center gap-3">
              <Switch
                id="add-pet-castrated"
                checked={values.castrated}
                onCheckedChange={(checked) => handleChange('castrated', checked)}
                disabled={isSubmitting}
                aria-label="Castrado"
              />
              <label
                htmlFor="add-pet-castrated"
                className="text-sm font-medium text-foreground cursor-pointer select-none"
              >
                Castrado
              </label>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">{values.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Fatura atual: <strong>{formatBRL(currentAmountCents)}</strong>
                {' → '}
                Nova fatura: <strong>{formatBRL(newAmountCents)}</strong>
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              O pet só passa a estar coberto a partir da próxima cobrança
              consolidada, quando a próxima fatura do tutor for paga.
            </p>

            <div
              className="rounded-lg border border-border bg-muted/30 p-4 overflow-y-auto text-sm text-foreground"
              style={{ maxHeight: '160px' }}
              role="region"
              aria-label="Texto do contrato adicional"
              tabIndex={0}
            >
              <MarkdownProse>{displayedContractText}</MarkdownProse>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="add-pet-tutor-acknowledged"
                ref={checkboxRef}
                type="checkbox"
                checked={tutorAcknowledged}
                onChange={(e) => setTutorAcknowledged(e.target.checked)}
                disabled={isSubmitting}
                aria-describedby={genericError ? 'add-pet-generic-error' : undefined}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-[#4E8C75]"
              />
              <label
                htmlFor="add-pet-tutor-acknowledged"
                className="text-sm leading-snug cursor-pointer select-none"
              >
                O tutor está ciente e concorda
              </label>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'form' ? (
            <>
              <Button type="button" variant="outline" onClick={requestClose}>
                Cancelar
              </Button>
              <Button type="submit" form="add-pet-form">
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!tutorAcknowledged || isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting
                  ? 'Adicionando…'
                  : genericError
                    ? 'Tentar novamente'
                    : 'Confirmar adição'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
