'use client';

import { useState, useEffect, useRef } from 'react';
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
import { RegisterClientUseCase } from '@/domain/client/register-client.use-case';
import { RegisterPetUseCase } from '@/domain/pet/register-pet.use-case';
import { RegisterContractUseCase } from '@/domain/contract/register-contract.use-case';
import { navigateToFieldStep } from '@/domain/client/field-to-step';
import { CONTRACT_VERSION } from '@/content/contrato';
import { publicSite } from '@/config/public-site';
import { loadDraft, saveDraft, clearDraft } from '@/lib/contratar-draft-storage';
import type { AddressData, RegisterClientInput } from '@/lib/types/client';
import type { RegisterPetInput } from '@/lib/types/pet';
import type { CheckoutSummary } from '@/domain/checkout/checkout.types';
import type { CepResult } from '@/lib/cep';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WizardStep = 0 | 1 | 2 | 3 | 4;

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
};

const em = (word: string) => (
  <em style={{ fontStyle: 'italic', color: '#5D7A5E' }}>{word}</em>
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

// ---------------------------------------------------------------------------
// ContratarPageClient
// ---------------------------------------------------------------------------

export function ContratarPageClient() {
  const [state, setState] = useState<ContratarState>(INITIAL_STATE);
  const hydratedRef = useRef(false);

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
      }));
    }
    hydratedRef.current = true;
  }, []);

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
    });
  }, [state.step, state.client, state.pets, state.contractAccepted, state.contractAcceptedAt]);

  // -------------------------------------------------------------------------
  // setStep — helper to update only the step field in state
  // -------------------------------------------------------------------------
  function setStep(s: 0 | 1 | 2 | 3): void {
    setState((prev) => ({ ...prev, step: s as WizardStep }));
  }

  // -------------------------------------------------------------------------
  // handleNextFromCadastro — async; calls validate-client dry-run before step 0→1
  // -------------------------------------------------------------------------
  async function handleNextFromCadastro(): Promise<void> {
    if (state.isValidating) return;
    setState((prev) => ({ ...prev, isValidating: true, fieldErrors: {} }));
    try {
      await validateClientUseCase(state.client as RegisterClientInput);
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
          setState((prev) => ({ ...prev, step: 2, fieldErrors: {} }));
        } else {
          setState((prev) => ({ ...prev, fieldErrors: allErrors }));
        }
        break;
      }

      case 2: {
        if (!state.contractAccepted) return;
        const contractAcceptedAt = new Date().toISOString();
        setState((prev) => ({ ...prev, step: 3, contractAcceptedAt, fieldErrors: {} }));
        break;
      }

      case 3: {
        if (!state.contractAcceptedAt) return;
        // First validate the draft synchronously to build the summary
        const useCase = new ValidateCheckoutDraftUseCase();
        let summary: CheckoutSummary;
        try {
          summary = useCase.execute({
            client: state.client as RegisterClientInput,
            pets: state.pets,
            contractAcceptedAt: state.contractAcceptedAt!,
          });
        } catch (e) {
          if (e instanceof ValidationError) {
            setState((prev) => ({ ...prev, fieldErrors: e.fieldErrors }));
          }
          return;
        }

        // Call API: register client then each pet then contract
        setState((prev) => ({ ...prev, isSubmitting: true, fieldErrors: {} }));
        try {
          const clientUseCase = new RegisterClientUseCase();
          const registeredClient = await clientUseCase.execute(
            state.client as RegisterClientInput,
          );

          const petUseCase = new RegisterPetUseCase();
          const createdPetIds: string[] = [];
          for (const pet of state.pets) {
            const createdPet = await petUseCase.execute(registeredClient.id, pet);
            createdPetIds.push(createdPet.id);
          }

          const contractUseCase = new RegisterContractUseCase();
          const contractResult = await contractUseCase.execute({
            clientId: registeredClient.id,
            petIds: createdPetIds,
            contractVersion: CONTRACT_VERSION,
            consentedAt: state.contractAcceptedAt!,
          });

          // Clear draft only after full success (client + pets + contract)
          clearDraft();
          setState((prev) => ({
            ...prev,
            step: 4,
            summary,
            isSubmitting: false,
            fieldErrors: {},
            planIds: contractResult.plan_ids,
          }));
        } catch (e) {
          if (e instanceof ValidationError) {
            setState((prev) => ({ ...prev, isSubmitting: false, fieldErrors: e.fieldErrors }));
            navigateToFieldStep(e.fieldErrors, setStep);
          } else {
            setState((prev) => ({
              ...prev,
              isSubmitting: false,
              fieldErrors: { _form: 'Erro inesperado ao finalizar.' },
            }));
          }
        }
        break;
      }

      default:
        break;
    }
  }

  // -------------------------------------------------------------------------
  // handleBack — decrement step, clear errors
  // -------------------------------------------------------------------------
  function handleBack(): void {
    if (state.step === 0) return;
    setState((prev) => ({
      ...prev,
      step: (prev.step - 1) as WizardStep,
      fieldErrors: {},
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
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 space-y-8">
      <ContratarStepper steps={STEPPER_STEPS} current={state.step} />

      {state.step === 0 && (
        <>
          {state.fieldErrors['_form'] && (
            <p role="alert" className="text-sm text-red-600 rounded-md border border-red-200 bg-red-50 px-4 py-2">
              {state.fieldErrors['_form']}
            </p>
          )}
          <StepCadastro
            data={state.client}
            errors={state.fieldErrors}
            onChange={handleClientChange}
            onAddressLookup={handleAddressLookup}
            onNext={handleNext}
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
          pricePerPetCents={publicSite.price.perPetCents}
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
        />
      )}

      {state.step === 3 && state.summary === null && (
        <StepPagamento
          summary={{
            clientName: (state.client as RegisterClientInput).name ?? '',
            pets: state.pets.map((p) => ({
              name: p.name,
              species: p.species,
            })),
            pricePerPetCents: publicSite.price.perPetCents,
            totalCents: state.pets.length * publicSite.price.perPetCents,
          }}
          onNext={handleNext}
          onBack={handleBack}
          isSubmitting={state.isSubmitting}
          formError={state.fieldErrors['_form']}
        />
      )}
    </main>
  );
}
