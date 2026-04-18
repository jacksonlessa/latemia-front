'use client';

import { useState } from 'react';
import { ContratarStepper } from '@/components/public/contratar/atoms/contratar-stepper';
import {
  StepCadastro,
  StepPets,
  StepContrato,
  StepPagamento,
  StepSucesso,
} from '@/components/public/contratar/organisms';
import { ClientEntity } from '@/domain/client/client.entity';
import { PetEntity } from '@/domain/pet/pet.entity';
import { ValidationError } from '@/lib/validation-error';
import { ValidateCheckoutDraftUseCase } from '@/domain/checkout/validate-checkout-draft.use-case';
import { RegisterClientUseCase } from '@/domain/client/register-client.use-case';
import { RegisterPetUseCase } from '@/domain/pet/register-pet.use-case';
import { publicSite } from '@/config/public-site';
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
  pets: Array<Partial<RegisterPetInput> & { _id: string }>;
  contractAccepted: boolean;
  contractAcceptedAt: string | null;
  fieldErrors: Record<string, string>;
  summary: CheckoutSummary | null;
  isSubmitting: boolean;
}

const INITIAL_STATE: ContratarState = {
  step: 0,
  client: {},
  pets: [{ _id: crypto.randomUUID(), age_months: 0 }],
  contractAccepted: false,
  contractAcceptedAt: null,
  fieldErrors: {},
  summary: null,
  isSubmitting: false,
};

const STEPPER_STEPS = ['Cadastro', 'Pets', 'Contrato', 'Pagamento'];

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

  // -------------------------------------------------------------------------
  // handleNext — validates current step then advances
  // -------------------------------------------------------------------------
  async function handleNext(): Promise<void> {
    switch (state.step) {
      case 0: {
        try {
          ClientEntity.validate(state.client as RegisterClientInput);
          setState((prev) => ({ ...prev, step: 1, fieldErrors: {} }));
        } catch (e) {
          if (e instanceof ValidationError) {
            setState((prev) => ({ ...prev, fieldErrors: e.fieldErrors }));
          }
        }
        break;
      }

      case 1: {
        if (state.pets.length === 0) return;
        const allErrors: Record<string, string> = {};
        let allValid = true;
        state.pets.forEach((pet, i) => {
          try {
            PetEntity.validate(pet as RegisterPetInput);
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
            pets: state.pets as RegisterPetInput[],
            contractAcceptedAt: state.contractAcceptedAt!,
          });
        } catch (e) {
          if (e instanceof ValidationError) {
            setState((prev) => ({ ...prev, fieldErrors: e.fieldErrors }));
          }
          return;
        }

        // Call API: register client then each pet
        setState((prev) => ({ ...prev, isSubmitting: true, fieldErrors: {} }));
        try {
          const clientUseCase = new RegisterClientUseCase();
          const registeredClient = await clientUseCase.execute(
            state.client as RegisterClientInput,
          );

          const petUseCase = new RegisterPetUseCase();
          for (const pet of state.pets) {
            await petUseCase.execute(registeredClient.id, pet as RegisterPetInput);
          }

          setState((prev) => ({ ...prev, step: 4, summary, isSubmitting: false, fieldErrors: {} }));
        } catch (e) {
          if (e instanceof ValidationError) {
            setState((prev) => ({ ...prev, isSubmitting: false, fieldErrors: e.fieldErrors }));
          } else {
            setState((prev) => ({
              ...prev,
              isSubmitting: false,
              fieldErrors: { _form: 'Ocorreu um erro inesperado. Tente novamente.' },
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
  // handlePetChange — updates a single field in a specific pet
  // -------------------------------------------------------------------------
  function handlePetChange(
    id: string,
    field: keyof RegisterPetInput,
    value: unknown,
  ): void {
    setState((prev) => ({
      ...prev,
      pets: prev.pets.map((pet) =>
        pet._id === id ? { ...pet, [field]: value } : pet,
      ),
    }));
  }

  // -------------------------------------------------------------------------
  // handleAddPet — appends a new blank pet entry
  // -------------------------------------------------------------------------
  function handleAddPet(): void {
    setState((prev) => ({
      ...prev,
      pets: [...prev.pets, { _id: crypto.randomUUID(), age_months: 0 }],
    }));
  }

  // -------------------------------------------------------------------------
  // handleRemovePet — removes a pet by _id (minimum 1 pet enforced)
  // -------------------------------------------------------------------------
  function handleRemovePet(id: string): void {
    if (state.pets.length <= 1) return;
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
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 space-y-8">
      <ContratarStepper steps={STEPPER_STEPS} current={state.step} />

      {state.step === 0 && (
        <StepCadastro
          data={state.client}
          errors={state.fieldErrors}
          onChange={handleClientChange}
          onAddressLookup={handleAddressLookup}
          onNext={handleNext}
        />
      )}

      {state.step === 1 && (
        <StepPets
          pets={state.pets}
          errors={state.fieldErrors}
          onPetChange={handlePetChange}
          onAddPet={handleAddPet}
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
              name: (p as RegisterPetInput).name ?? '',
              species: (p as RegisterPetInput).species,
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
