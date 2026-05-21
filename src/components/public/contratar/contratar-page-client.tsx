'use client';

import { useState, useEffect, useRef } from 'react';
import { Events, track, trackWithCooldown } from '@/lib/analytics/events';
import { ContratarStepper } from '@/components/public/contratar/atoms/contratar-stepper';
import {
  StepCadastro,
  StepPets,
  StepContrato,
  StepPagamento,
  StepSucesso,
} from '@/components/public/contratar/organisms';
import { PetEntity } from '@/domain/pet/pet.entity';
import { ValidationError } from '@/lib/validation-error';
import { validateClientUseCase } from '@/domain/client/validate-client.use-case';
import { ValidateCheckoutDraftUseCase } from '@/domain/checkout/validate-checkout-draft.use-case';
import {
  getPublicConfig,
  FALLBACK_PRICE_PER_PET_CENTS,
  type PublicConfig,
} from '@/domain/public-config/get-public-config.use-case';
import {
  FinalizeCheckoutUseCase,
  CheckoutError,
  type CheckoutStage,
  type OnStageChangePayload,
} from '@/domain/checkout/finalize-checkout.use-case';
import type { CardFormValue } from '@/components/public/contratar/organisms/card-form';
import { navigateToFieldStep } from '@/domain/client/field-to-step';
import { CONTRACT_VERSION, CONTRATO_TEXTO } from '@/content/contrato';
import { loadDraft, saveDraft, clearDraft } from '@/lib/contratar-draft-storage';
import { sha256Hex } from '@/lib/crypto';
import { digitsToE164 } from '@/lib/to-e164';
import type {
  AddressData,
  RegisterClientInput,
  Touchpoint,
} from '@/lib/types/client';
import type { RegisterPetInput } from '@/lib/types/pet';
import type { CheckoutSummary } from '@/domain/checkout/checkout.types';
import type { CepResult } from '@/lib/cep';
import type { StepCadastroTouchpointBundle } from '@/components/public/contratar/organisms/step-cadastro';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WizardStep = 0 | 1 | 2 | 3 | 4;

interface CheckoutResumeState {
  clientId?: string;
  petIds?: string[];
  pagarmeCustomerId?: string;
  pagarmeSubscriptionId?: string;
}

interface ContratarState {
  step: WizardStep;
  client: Partial<RegisterClientInput>;
  pets: Array<RegisterPetInput & { _id: string }>;
  contractAccepted: boolean;
  contractAcceptedAt: string | null;
  fieldErrors: Record<string, string>;
  summary: CheckoutSummary | null;
  isSubmitting: boolean;
  isValidating: boolean;
  planIds: string[];
  /** Modo do passo 4 (form ↔ painel de progresso ↔ erro). */
  paymentMode: 'form' | 'processing' | 'error';
  currentStage: CheckoutStage;
  errorStage?: number;
  errorMessage?: string;
  /**
   * ID de correlação da tentativa falha — exibido na UI para o cliente
   * poder reportar ao suporte (propagado de `CheckoutError.requestId`).
   */
  errorRequestId?: string;
  /** false = erro terminal (ex: já tem assinatura); oculta o botão "Tentar novamente". */
  errorRetryable: boolean;
  /** Trigger para limpar CVV após erro (RF12). */
  clearCvvOnError: boolean;
  /** Estado de resume entre tentativas (idempotência — RF10). */
  checkoutResume: CheckoutResumeState;
  /**
   * Snapshot do bundle de touchpoints capturado pelo `TouchpointProvider`
   * no momento em que o usuário avançou do passo 1. Cada lado é `undefined`
   * quando o visitante não tinha atribuição capturada — nunca emitimos
   * `null` para a API (PRD seo-analytics-lgpd-utm §1.7 — task 7.0).
   */
  touchpoints?: { first?: Touchpoint; last?: Touchpoint };
  /**
   * UUID v4 de correlação OTP gerado pelo `StepContrato` quando o cliente
   * clica em "Avançar" no passo 2 e a flag `otp_contract_enabled` está
   * ativa. Persistido no draft para sobreviver a refresh. Não-PII.
   */
  contractAttemptId: string | null;
  /**
   * Token opaco devolvido pelo `POST /v1/otp/contract/verify` quando o
   * cliente digita o código correto. Consumido por
   * `POST /v1/register/contract` na etapa 7 do `FinalizeCheckoutUseCase`.
   * Não-PII.
   */
  otpVerificationToken: string | null;
  /**
   * Quando o backend rejeita o `POST /v1/register/contract` com
   * `OTP_VERIFICATION_REQUIRED` ou `OTP_VERIFICATION_TOKEN_INVALID` (Task
   * 11.0), guardamos o código aqui para que a UI possa oferecer o botão
   * "Voltar ao contrato" — caminho dedicado de remediação que volta ao
   * passo 2 e limpa o token expirado sem perder pets/cadastro.
   */
  checkoutOtpErrorCode: string | null;
}

const INITIAL_STATE: ContratarState = {
  step: 0,
  client: {},
  pets: [],
  contractAccepted: false,
  contractAcceptedAt: null,
  fieldErrors: {},
  summary: null,
  isSubmitting: false,
  isValidating: false,
  planIds: [],
  paymentMode: 'form',
  currentStage: 1,
  errorStage: undefined,
  errorMessage: undefined,
  errorRequestId: undefined,
  errorRetryable: true,
  clearCvvOnError: false,
  checkoutResume: {},
  touchpoints: undefined,
  contractAttemptId: null,
  otpVerificationToken: null,
  checkoutOtpErrorCode: null,
};

// Task 11.0 — backend error codes that mean the OTP verification token
// is missing or expired. When we see either of these in stage 7 we must
// send the user back to step 2 so they can request a fresh code.
const OTP_VERIFICATION_FAILURE_CODES = new Set([
  'OTP_VERIFICATION_REQUIRED',
  'OTP_VERIFICATION_TOKEN_INVALID',
]);

const em = (word: string) => (
  <span style={{ color: '#5D7A5E' }}>{word}</span>
);

const STEPPER_STEPS = [
  { label: 'Cadastro',  title: <>Vamos começar pelo {em('tutor')}.</>,  helper: 'Seus dados ficam protegidos e servem apenas para emitir o contrato e o débito mensal.' },
  { label: 'Pets',      title: <>Quem vamos {em('cuidar')}?</>,          helper: '' },
  { label: 'Contrato',  title: <>O {em('acordo')} entre nós.</>,         helper: 'Leia com calma. Pode baixar em PDF e guardar.' },
  { label: 'Pagamento', title: <>Seu {em('débito')} mensal.</>,          helper: 'Cobrança automática todo mês. Você pode cancelar a qualquer momento.' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sets a nested value in an object using dot-notation path.
 * E.g. setNestedValue({}, 'address.street', 'Rua X') → { address: { street: 'Rua X' } }
 */
function setNestedValue<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const parts = path.split('.');
  if (parts.length === 1) {
    return { ...obj, [path]: value };
  }
  const [head, ...rest] = parts;
  const nested = (obj[head] as Record<string, unknown>) ?? {};
  return {
    ...obj,
    [head]: setNestedValue(nested, rest.join('.'), value),
  };
}

function buildCheckoutPathSignature(): string {
  if (typeof window === 'undefined') return '/contratar';
  return `${window.location.pathname}${window.location.search}`;
}

// ---------------------------------------------------------------------------
// ContratarPageClient
// ---------------------------------------------------------------------------

export function ContratarPageClient() {
  const [state, setState] = useState<ContratarState>(INITIAL_STATE);
  const hydratedRef = useRef(false);

  // -------------------------------------------------------------------------
  // 9.0 Public config — OTP feature flag + subscription price.
  //
  // Fetched once on mount via `getPublicConfig()`. We initialise with the
  // fail-safe defaults the use-case itself would return on any error path
  // so SSR/initial render is deterministic and hydration mismatches are
  // impossible. The use-case never rejects; on any error path it resolves
  // to `{ otpContractEnabled: false, pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS }`.
  // -------------------------------------------------------------------------
  const [publicConfig, setPublicConfig] = useState<PublicConfig>({
    otpContractEnabled: false,
    pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS,
  });

  useEffect(() => {
    let cancelled = false;
    getPublicConfig().then((cfg) => {
      if (!cancelled) setPublicConfig(cfg);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------------------------------
  // 5.1 Hydrate state from sessionStorage on mount (SSR-safe via useEffect)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const draft = loadDraft();
    if (draft !== null) {
      setState((prev) => ({
        ...prev,
        step: draft.step,
        client: draft.client,
        pets: draft.pets,
        contractAccepted: draft.contractAccepted,
        contractAcceptedAt: draft.contractAcceptedAt,
        // OTP fields are optional in legacy drafts — default to null.
        contractAttemptId: draft.contractAttemptId ?? null,
        otpVerificationToken: draft.otpVerificationToken ?? null,
      }));
    }
    hydratedRef.current = true;
  }, []);

  // -------------------------------------------------------------------------
  // Analytics — `begin_checkout` (PRD §5.3). Fires once per mount; consent
  // gating is delegated to `track()`/Consent Mode (no-ops without consent).
  // -------------------------------------------------------------------------
  useEffect(() => {
    const pathSignature = buildCheckoutPathSignature();
    trackWithCooldown(
      `begin_checkout:${pathSignature}`,
      Events.BeginCheckout,
      { page_path: pathSignature },
    );
  }, []);

  // -------------------------------------------------------------------------
  // 5.1b Focus the first invalid field after automatic step navigation
  // When fieldErrors is set and step changes (navigateToFieldStep), move keyboard
  // focus to the first element with aria-invalid="true" so screen-reader users
  // are not left with the cursor at an unexpected position.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (Object.keys(state.fieldErrors).length === 0) return;
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    el?.focus();
  }, [state.fieldErrors, state.step]);

  // -------------------------------------------------------------------------
  // 5.2 Persist relevant state to sessionStorage on each relevant change
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Skip before hydration completes to avoid overwriting the draft with INITIAL_STATE
    if (!hydratedRef.current) return;
    // Do not persist terminal step (success) — clearDraft handles that
    if (state.step === 4) return;
    saveDraft({
      step: state.step as 0 | 1 | 2 | 3,
      client: state.client,
      pets: state.pets,
      contractAccepted: state.contractAccepted,
      contractAcceptedAt: state.contractAcceptedAt,
      // Persist the OTP fields only when they have a value — `undefined`
      // keeps the serialized form lean and the load path defaults to null.
      contractAttemptId: state.contractAttemptId ?? undefined,
      otpVerificationToken: state.otpVerificationToken ?? undefined,
    });
  }, [
    state.step,
    state.client,
    state.pets,
    state.contractAccepted,
    state.contractAcceptedAt,
    state.contractAttemptId,
    state.otpVerificationToken,
  ]);

  // -------------------------------------------------------------------------
  // setStep — helper to update only the step field in state
  // -------------------------------------------------------------------------
  function setStep(s: 0 | 1 | 2 | 3): void {
    setState((prev) => ({ ...prev, step: s as WizardStep }));
  }

  // -------------------------------------------------------------------------
  // handleTouchpointsResolved — invoked by StepCadastro right before onNext.
  // Persists the bundle in component state so we can forward it to
  // FinalizeCheckoutUseCase → RegisterClientUseCase at stage 3.
  // -------------------------------------------------------------------------
  function handleTouchpointsResolved(
    bundle: StepCadastroTouchpointBundle,
  ): void {
    // Persist only when there is something to send. Empty object means the
    // visitor had no captured attribution — keep state as `undefined` so
    // FinalizeCheckoutUseCase omits the field entirely from the wire.
    const hasData = Boolean(bundle.first) || Boolean(bundle.last);
    setState((prev) => ({
      ...prev,
      touchpoints: hasData ? bundle : undefined,
    }));
  }

  // -------------------------------------------------------------------------
  // Task 10.0 — OTP handlers
  //
  // `StepContrato` owns the local OTP state machine; the parent only
  // persists the two opaque tokens so the wizard can resume on refresh
  // and so the verification token can flow into `FinalizeCheckoutUseCase`
  // later.
  // -------------------------------------------------------------------------
  function handleContractAttemptIdAssigned(id: string): void {
    setState((prev) =>
      prev.contractAttemptId === id ? prev : { ...prev, contractAttemptId: id },
    );
  }

  function handleOtpVerified(verificationToken: string): void {
    setState((prev) => ({ ...prev, otpVerificationToken: verificationToken }));
  }

  // -------------------------------------------------------------------------
  // handleNextFromCadastro — async; calls validate-client dry-run before step 0→1
  // -------------------------------------------------------------------------
  async function handleNextFromCadastro(): Promise<void> {
    if (state.isValidating) return;
    setState((prev) => ({ ...prev, isValidating: true, fieldErrors: {} }));
    try {
      await validateClientUseCase(state.client as RegisterClientInput);
      track(Events.CompletedTutor);
      setState((prev) => ({ ...prev, step: 1, isValidating: false }));
    } catch (e) {
      if (e instanceof ValidationError) {
        setState((prev) => ({ ...prev, isValidating: false, fieldErrors: e.fieldErrors }));
        navigateToFieldStep(e.fieldErrors, setStep);
      } else {
        setState((prev) => ({
          ...prev,
          isValidating: false,
          fieldErrors: { _form: 'Não foi possível validar seus dados. Verifique sua conexão.' },
        }));
      }
    }
  }

  // -------------------------------------------------------------------------
  // handleNext — validates current step then advances
  // -------------------------------------------------------------------------
  async function handleNext(): Promise<void> {
    switch (state.step) {
      case 0: {
        await handleNextFromCadastro();
        break;
      }

      case 1: {
        if (state.pets.length < 1) return;
        const allErrors: Record<string, string> = {};
        let allValid = true;
        state.pets.forEach((pet, i) => {
          try {
            PetEntity.validate(pet);
          } catch (e) {
            allValid = false;
            if (e instanceof ValidationError) {
              for (const [field, msg] of Object.entries(e.fieldErrors)) {
                allErrors[`pets[${i}].${field}`] = msg;
              }
            }
          }
        });
        if (allValid) {
          const petsCount = state.pets.length;
          track(Events.CompletedPet, {
            pets_count: petsCount,
            value: (petsCount * publicConfig.pricePerPetCents) / 100,
            currency: 'BRL',
          });
          setState((prev) => ({ ...prev, step: 2, fieldErrors: {} }));
        } else {
          setState((prev) => ({ ...prev, fieldErrors: allErrors }));
        }
        break;
      }

      case 2: {
        if (!state.contractAccepted) return;
        const contractAcceptedAt = new Date().toISOString();
        track(Events.CompletedContract, {
          otp_enabled: publicConfig.otpContractEnabled,
        });
        setState((prev) => ({ ...prev, step: 3, contractAcceptedAt, fieldErrors: {} }));
        break;
      }

      default:
        break;
    }
  }

  // -------------------------------------------------------------------------
  // handleFinalizeCheckout — entry point for step 3 "Concluir" click.
  // Orchestrates the 8 stages via FinalizeCheckoutUseCase, updating the
  // payment progress panel on every transition.
  // -------------------------------------------------------------------------
  async function handleFinalizeCheckout(cardInput: CardFormValue): Promise<void> {
    if (!state.contractAcceptedAt) return;

    // Guard — when OTP is enabled, both tokens must be present before
    // submitting. Without this, the backend would reject with
    // OTP_VERIFICATION_REQUIRED after burning stages 3–5 unnecessarily.
    if (
      publicConfig.otpContractEnabled &&
      (!state.otpVerificationToken || !state.contractAttemptId)
    ) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        paymentMode: 'error',
        errorStage: 6,
        errorMessage:
          'Sua sessão de verificação expirou. Volte ao contrato e gere um novo código.',
        errorRequestId: undefined,
        errorRetryable: true,
        checkoutOtpErrorCode: 'OTP_VERIFICATION_REQUIRED',
      }));
      return;
    }

    // Build summary synchronously (used to render success screen)
    const validateUseCase = new ValidateCheckoutDraftUseCase();
    let summary: CheckoutSummary;
    try {
      summary = validateUseCase.execute(
        {
          client: state.client as RegisterClientInput,
          pets: state.pets,
          contractAcceptedAt: state.contractAcceptedAt,
        },
        { pricePerPetCents: publicConfig.pricePerPetCents },
      );
    } catch (e) {
      if (e instanceof ValidationError) {
        setState((prev) => ({ ...prev, fieldErrors: e.fieldErrors }));
      }
      return;
    }

    // RF10: pré-marca stages 3/4 como done quando já criadas
    const resumed = state.checkoutResume;
    const initialStage: CheckoutStage = (() => {
      if (resumed.pagarmeSubscriptionId) return 7;
      if (resumed.pagarmeCustomerId) return 6;
      if (resumed.petIds && resumed.petIds.length === state.pets.length) return 5;
      if (resumed.clientId) return 4;
      return 1;
    })();

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      fieldErrors: {},
      paymentMode: 'processing',
      currentStage: initialStage,
      errorStage: undefined,
      errorMessage: undefined,
      errorRequestId: undefined,
      checkoutOtpErrorCode: null,
      clearCvvOnError: false,
    }));

    let paymentCompletedTracked = false;
    const onStageChange = (payload: OnStageChangePayload): void => {
      if (!paymentCompletedTracked && payload.stage === 7) {
        paymentCompletedTracked = true;
        track(Events.CompletedPayment, {
          pets_count: state.pets.length,
          value: (state.pets.length * publicConfig.pricePerPetCents) / 100,
          currency: 'BRL',
          checkout_stage: payload.stage,
        });
      }
      setState((prev) => ({
        ...prev,
        currentStage: payload.stage,
      }));
    };

    // Task 11.0 — Compute SHA-256 of the contract text actually shown to
    // the customer. The hash is part of the legal proof recorded in
    // `ContractAcceptanceEvidence`. `sha256Hex` returns `''` on legacy
    // browsers without `crypto.subtle`; backend tolerates the empty value.
    const contractTextHash = await sha256Hex(CONTRATO_TEXTO);

    try {
      const useCase = new FinalizeCheckoutUseCase();
      const result = await useCase.execute(
        {
          clientInput: state.client as RegisterClientInput,
          pets: state.pets.map((p) => ({ name: p.name, data: p })),
          cardInput,
          contractAcceptedAt: state.contractAcceptedAt,
          contractVersion: CONTRACT_VERSION,
          resume: resumed,
          touchpoints: state.touchpoints,
          // OTP evidence — propagated only when present in state (i.e. the
          // public-config flag was on for this session). Each `undefined`
          // value is omitted downstream by `RegisterContractUseCase`.
          verificationToken: state.otpVerificationToken ?? undefined,
          contractAttemptId: state.contractAttemptId ?? undefined,
          contractTextHash,
        },
        onStageChange,
      );

      clearDraft();
      setState((prev) => ({
        ...prev,
        step: 4,
        summary,
        isSubmitting: false,
        paymentMode: 'form',
        planIds: result.planIds,
        currentStage: 8,
        errorRetryable: true,
        checkoutResume: {
          clientId: result.clientId,
          petIds: result.petIds,
          pagarmeCustomerId: result.pagarmeCustomerId,
          pagarmeSubscriptionId: result.pagarmeSubscriptionId,
        },
      }));
    } catch (e) {
      if (e instanceof CheckoutError) {
        // Task 11.0 — OTP token rejection from `POST /v1/register/contract`.
        // The token expired or was missing; keep the wizard in error mode
        // but expose the dedicated "Voltar ao contrato" remediation so the
        // user can refresh the OTP without losing cadastro/pets/cartão.
        const isOtpFailure = OTP_VERIFICATION_FAILURE_CODES.has(e.code);

        // RF12: pós-rollback (errorStage >= 6), reset do customer reference
        // local — usuário recomeça a partir da etapa 5 idempotente.
        const shouldClearCustomer = e.stage >= 6;
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          paymentMode: 'error',
          errorStage: e.stage,
          errorMessage: e.message,
          errorRequestId: e.requestId,
          errorRetryable: e.retryable,
          checkoutOtpErrorCode: isOtpFailure ? e.code : null,
          checkoutResume: shouldClearCustomer
            ? {
                clientId: prev.checkoutResume.clientId,
                petIds: prev.checkoutResume.petIds,
              }
            : {
                ...prev.checkoutResume,
                clientId: prev.checkoutResume.clientId ?? undefined,
              },
        }));
        return;
      }
      // Erro inesperado — fallback genérico no painel
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        paymentMode: 'error',
        errorStage: prev.currentStage,
        errorMessage: 'Erro inesperado ao finalizar. Tente novamente.',
        errorRequestId: undefined,
        errorRetryable: true,
      }));
    }
  }

  // -------------------------------------------------------------------------
  // handleRetryCheckout — back to form mode with CVV reset (RF12)
  // -------------------------------------------------------------------------
  function handleRetryCheckout(): void {
    setState((prev) => ({
      ...prev,
      paymentMode: 'form',
      errorStage: undefined,
      errorMessage: undefined,
      errorRequestId: undefined,
      errorRetryable: true,
      checkoutOtpErrorCode: null,
      clearCvvOnError: true,
      isSubmitting: false,
    }));
  }

  // -------------------------------------------------------------------------
  // Task 11.0 — handleBackToContract
  //
  // Invoked from the payment-stage error panel when the backend rejected
  // the contract registration with an OTP verification failure (token
  // expired or invalid). Sends the user back to step 2 with the OTP token
  // cleared so the next OTP cycle requests a brand-new code. We keep all
  // captured `client`/`pets`/`contractAttemptId` so the customer does not
  // re-enter data; only the expired token and the error overlay are reset.
  // -------------------------------------------------------------------------
  function handleBackToContract(): void {
    setState((prev) => ({
      ...prev,
      step: 2,
      paymentMode: 'form',
      errorStage: undefined,
      errorMessage: undefined,
      errorRequestId: undefined,
      errorRetryable: true,
      checkoutOtpErrorCode: null,
      otpVerificationToken: null,
      isSubmitting: false,
      clearCvvOnError: false,
    }));
  }

  // -------------------------------------------------------------------------
  // handleBack — decrement step, clear errors. Also clears the OTP token
  // (paridade com handleBackToContract) — qualquer caminho que sai do step
  // de pagamento de volta para o de contrato precisa de um OTP fresco.
  // -------------------------------------------------------------------------
  function handleBack(): void {
    if (state.step === 0) return;
    setState((prev) => ({
      ...prev,
      step: (prev.step - 1) as WizardStep,
      fieldErrors: {},
      otpVerificationToken: null,
    }));
  }

  // -------------------------------------------------------------------------
  // handleClientChange — supports dot-notation (e.g. 'address.street')
  // -------------------------------------------------------------------------
  function handleClientChange(field: string, value: string): void {
    setState((prev) => ({
      ...prev,
      client: setNestedValue(prev.client as Record<string, unknown>, field, value) as Partial<RegisterClientInput>,
    }));
  }

  // -------------------------------------------------------------------------
  // handleAddressLookup — fills address fields from CEP result
  // -------------------------------------------------------------------------
  function handleAddressLookup(result: CepResult | null): void {
    if (result === null) return; // lookup failed — leave existing field values intact
    setState((prev) => {
      const address: Partial<AddressData> = prev.client.address ?? {};
      const mergedAddress = {
        ...address,
        street: result.street,
        neighborhood: result.neighborhood,
        city: result.city,
        state: result.state,
      };
      return {
        ...prev,
        client: {
          ...prev.client,
          address: mergedAddress as AddressData,
        },
      };
    });
  }

  // -------------------------------------------------------------------------
  // handleSavePet — inserts when `_id` is missing or updates when present.
  // Used by the new StepPets A/B state machine where a single PetForm submits
  // a complete validated pet object back to the orchestrator.
  // -------------------------------------------------------------------------
  function handleSavePet(pet: RegisterPetInput & { _id?: string }): void {
    track(pet._id ? Events.EditedPet : Events.AddedPet);
    setState((prev) => {
      if (pet._id) {
        const id = pet._id;
        return {
          ...prev,
          pets: prev.pets.map((p) =>
            p._id === id ? { ...pet, _id: id } : p,
          ),
        };
      }
      const newId = crypto.randomUUID();
      return {
        ...prev,
        pets: [...prev.pets, { ...pet, _id: newId }],
      };
    });
  }

  // -------------------------------------------------------------------------
  // handleRemovePet — removes a pet by `_id`. The new flow allows removing the
  // last pet (StepPets falls back to State A automatically). Validation on
  // "Avançar" still requires at least one saved pet.
  // -------------------------------------------------------------------------
  function handleRemovePet(id: string): void {
    track(Events.RemovedPet);
    setState((prev) => ({
      ...prev,
      pets: prev.pets.filter((pet) => pet._id !== id),
    }));
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (state.step === 4 && state.summary !== null) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10">
        <StepSucesso
          clientName={state.summary.clientName}
          pets={state.summary.pets}
          planIds={state.planIds}
          totalCents={state.summary.totalCents}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 space-y-8">
      <ContratarStepper steps={STEPPER_STEPS} current={state.step} />

      {state.step === 0 && (
        <>
          <StepCadastro
            data={state.client}
            errors={state.fieldErrors}
            onChange={handleClientChange}
            onAddressLookup={handleAddressLookup}
            onNext={handleNext}
            onTouchpointsResolved={handleTouchpointsResolved}
            isLoading={state.isValidating}
          />
        </>
      )}

      {state.step === 1 && (
        <StepPets
          pets={state.pets}
          onSavePet={handleSavePet}
          onRemovePet={handleRemovePet}
          onNext={handleNext}
          onBack={handleBack}
          pricePerPetCents={publicConfig.pricePerPetCents}
        />
      )}

      {state.step === 2 && (
        <StepContrato
          accepted={state.contractAccepted}
          onAcceptedChange={(value) =>
            setState((prev) => ({ ...prev, contractAccepted: value }))
          }
          onNext={handleNext}
          onBack={handleBack}
          otpEnabled={publicConfig.otpContractEnabled}
          // Phone digits collected at step 0 are stored as the BR mask
          // (`(11) 98765-4321`). Convert to E.164 here — the helper is
          // idempotent and tolerant of already-normalised values.
          phone={digitsToE164((state.client as RegisterClientInput).phone ?? '')}
          contractAttemptId={state.contractAttemptId}
          onContractAttemptIdAssigned={handleContractAttemptIdAssigned}
          onVerified={handleOtpVerified}
        />
      )}

      {state.step === 3 && state.summary === null && (
        <>
          <StepPagamento
            summary={{
              clientName: (state.client as RegisterClientInput).name ?? '',
              pets: state.pets.map((p) => ({
                name: p.name,
                species: p.species,
              })),
              pricePerPetCents: publicConfig.pricePerPetCents,
              totalCents: state.pets.length * publicConfig.pricePerPetCents,
            }}
            onSubmit={handleFinalizeCheckout}
            onBack={handleBack}
            onRetry={
              // Task 11.0 — when the failure was an OTP token rejection,
              // a plain retry would hit the same 403. Hide "Tentar
              // novamente" and surface the dedicated "Voltar ao contrato"
              // button below instead.
              state.errorRetryable && state.checkoutOtpErrorCode === null
                ? handleRetryCheckout
                : undefined
            }
            mode={state.paymentMode}
            currentStage={state.currentStage}
            errorStage={state.errorStage}
            errorMessage={state.errorMessage}
            formError={state.fieldErrors['_form']}
            clearCvvOnError={state.clearCvvOnError}
            requestId={state.errorRequestId}
          />

          {/* Task 11.0 — OTP remediation. Rendered only when the backend
              rejected the contract registration because the OTP token
              expired or was invalid. The button takes the user back to
              step 2 and clears the stale token so the next attempt starts
              a fresh OTP cycle. */}
          {state.checkoutOtpErrorCode !== null ? (
            <div
              role="group"
              aria-label="Refazer verificação por código"
              className="rounded-lg border border-border bg-muted/30 p-4 space-y-2"
            >
              <p className="text-sm text-foreground">
                Sua verificação expirou. Volte ao passo anterior para
                refazer o código.
              </p>
              <button
                type="button"
                onClick={handleBackToContract}
                className="inline-flex items-center justify-center rounded-md bg-[#4E8C75] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d7260]"
              >
                Voltar ao contrato
              </button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
