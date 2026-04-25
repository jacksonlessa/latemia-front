/**
 * Integration tests for ContratarPageClient wizard.
 *
 * Mocks all use-cases and draft storage to test the wizard flow in isolation.
 * No personal data is included in assertions or error messages.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ContratarPageClient } from './contratar-page-client';
import { ValidationError } from '@/lib/validation-error';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/contratar-draft-storage', () => ({
  loadDraft: vi.fn().mockReturnValue(null),
  saveDraft: vi.fn(),
  clearDraft: vi.fn(),
}));

const mockClientExecute = vi.fn().mockResolvedValue({
  id: 'client-uuid-1',
  name: 'Maria da Silva',
});
const mockPetExecute = vi.fn()
  .mockResolvedValueOnce({ id: 'pet-uuid-1' })
  .mockResolvedValue({ id: 'pet-uuid-2' });
const mockContractExecute = vi.fn().mockResolvedValue({
  contract_id: 'contract-uuid-1',
  plan_ids: ['plan-uuid-1', 'plan-uuid-2'],
});
const mockCheckoutExecute = vi.fn().mockReturnValue({
  clientName: 'Maria da Silva',
  pets: [{ name: 'Rex', species: 'canino' }],
  pricePerPetCents: 4990,
  totalCents: 4990,
});

vi.mock('@/domain/client/register-client.use-case', () => ({
  RegisterClientUseCase: class {
    execute = mockClientExecute;
  },
}));

vi.mock('@/domain/pet/register-pet.use-case', () => ({
  RegisterPetUseCase: class {
    execute = mockPetExecute;
  },
}));

vi.mock('@/domain/contract/register-contract.use-case', () => ({
  RegisterContractUseCase: class {
    execute = mockContractExecute;
  },
}));

vi.mock('@/domain/checkout/validate-checkout-draft.use-case', () => ({
  ValidateCheckoutDraftUseCase: class {
    execute = mockCheckoutExecute;
  },
}));

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import { loadDraft, clearDraft } from '@/lib/contratar-draft-storage';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validClient = {
  name: 'Maria da Silva',
  cpf: '529.982.247-25',
  email: 'maria@example.com',
  phone: '(11) 98765-4321',
  address: {
    cep: '01310-100',
    street: 'Avenida Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  },
};

const petBirthDate = new Date();
petBirthDate.setFullYear(petBirthDate.getFullYear() - 3);

const validPet = {
  _id: 'pet-local-1',
  name: 'Rex',
  species: 'canino' as const,
  breed: 'Labrador',
  birthDate: petBirthDate,
  sex: 'male' as const,
  weight: 28.5,
  castrated: true,
};

const validDraft = {
  step: 3 as const,
  client: validClient,
  pets: [validPet],
  contractAccepted: true,
  contractAcceptedAt: '2026-04-18T12:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();

  // Reset mock implementations to defaults after clearAllMocks
  mockClientExecute.mockResolvedValue({ id: 'client-uuid-1', name: 'Maria da Silva' });
  mockPetExecute
    .mockResolvedValueOnce({ id: 'pet-uuid-1' })
    .mockResolvedValue({ id: 'pet-uuid-2' });
  mockContractExecute.mockResolvedValue({
    contract_id: 'contract-uuid-1',
    plan_ids: ['plan-uuid-1', 'plan-uuid-2'],
  });
  mockCheckoutExecute.mockReturnValue({
    clientName: 'Maria da Silva',
    pets: [{ name: 'Rex', species: 'canino' }],
    pricePerPetCents: 4990,
    totalCents: 4990,
  });

  // crypto.randomUUID is available in jsdom but stub for determinism
  vi.stubGlobal('crypto', {
    randomUUID: vi.fn().mockReturnValue('pet-local-1'),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Helper: render wizard on step 3 (Pagamento) ready to submit
// ---------------------------------------------------------------------------

function renderAtStep3() {
  vi.mocked(loadDraft).mockReturnValue(validDraft);
  return render(<ContratarPageClient />);
}

// ---------------------------------------------------------------------------
// H1 Tests — Wizard integration
// ---------------------------------------------------------------------------

describe('ContratarPageClient — wizard submission (step 3 → 4)', () => {
  it('should call RegisterClientUseCase, RegisterPetUseCase, then RegisterContractUseCase in sequence', async () => {
    renderAtStep3();

    // Wait for hydration effect to fire and component to show step 3
    const concluirButton = await screen.findByRole('button', { name: /concluir/i });
    expect(concluirButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(concluirButton);
    });

    await waitFor(() => {
      expect(mockClientExecute).toHaveBeenCalledTimes(1);
      expect(mockPetExecute).toHaveBeenCalledTimes(1);
      expect(mockContractExecute).toHaveBeenCalledTimes(1);
    });
  });

  it('should advance to step 4 (success screen) with planIds after successful contract registration', async () => {
    renderAtStep3();

    const concluirButton = await screen.findByRole('button', { name: /concluir/i });

    await act(async () => {
      fireEvent.click(concluirButton);
    });

    // Step 4: success screen should display plan IDs as protocol
    await waitFor(() => {
      expect(screen.getByText(/plan-uuid-1/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/plan-uuid-2/i)).toBeInTheDocument();
  });

  it('should call clearDraft only after successful contract registration', async () => {
    renderAtStep3();

    const concluirButton = await screen.findByRole('button', { name: /concluir/i });

    await act(async () => {
      fireEvent.click(concluirButton);
    });

    await waitFor(() => {
      expect(clearDraft).toHaveBeenCalledTimes(1);
    });
  });

  it('should keep isSubmitting=true during submission and set it to false after success', async () => {
    // Make contract call slow so we can capture the in-progress state
    let resolveContract!: (value: { contract_id: string; plan_ids: string[] }) => void;
    const contractPromise = new Promise<{ contract_id: string; plan_ids: string[] }>(
      (resolve) => { resolveContract = resolve; },
    );

    // Override the contract mock for this test only
    mockContractExecute.mockReturnValueOnce(contractPromise);

    renderAtStep3();

    const concluirButton = await screen.findByRole('button', { name: /concluir/i });

    // Start submission (do not await)
    fireEvent.click(concluirButton);

    // Button should be disabled (isSubmitting=true) while waiting
    await waitFor(() => {
      expect(concluirButton).toBeDisabled();
    });

    // Now resolve the contract call
    await act(async () => {
      resolveContract({
        contract_id: 'contract-uuid-1',
        plan_ids: ['plan-uuid-1'],
      });
    });

    // After success, the step-4 screen is shown (button is gone)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /concluir/i })).not.toBeInTheDocument();
    });
  });

  it('should not call clearDraft and should display form error when contract registration fails', async () => {
    // Override the contract mock for this test to simulate an error
    mockContractExecute.mockRejectedValueOnce(
      new ValidationError({ _form: 'Ocorreu um erro inesperado. Tente novamente.' }),
    );

    renderAtStep3();

    const concluirButton = await screen.findByRole('button', { name: /concluir/i });

    await act(async () => {
      fireEvent.click(concluirButton);
    });

    await waitFor(() => {
      expect(clearDraft).not.toHaveBeenCalled();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Button should be re-enabled after error (isSubmitting=false)
    expect(concluirButton).not.toBeDisabled();
  });
});
