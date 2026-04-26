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

// Stub tokenize-card so the orchestrator does not hit the real Pagar.me endpoint.
vi.mock('@/lib/billing/tokenize-card', () => ({
  tokenizeCard: vi.fn().mockResolvedValue({ cardToken: 'token_abc' }),
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

const mockValidateClientUseCase = vi.fn().mockResolvedValue(undefined);

vi.mock('@/domain/client/validate-client.use-case', () => ({
  validateClientUseCase: (...args: unknown[]) => mockValidateClientUseCase(...args),
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

// Default fetch stub: handles /v1/checkout/customer + /v1/checkout/subscription
function installCheckoutFetchMock() {
  let subCounter = 0;
  const fetchMock = vi.fn(async (url: string) => {
    const u = String(url);
    if (u.includes('/v1/checkout/customer')) {
      return {
        ok: true,
        status: 201,
        json: () => Promise.resolve({ pagarme_customer_id: 'cus_1', created: true }),
      } as unknown as Response;
    }
    if (u.includes('/v1/checkout/subscription')) {
      subCounter++;
      return {
        ok: true,
        status: 201,
        json: () => Promise.resolve({ pagarme_subscription_id: `sub_${subCounter}` }),
      } as unknown as Response;
    }
    if (u.includes('/v1/checkout/rollback')) {
      return { ok: true, status: 200, json: () => Promise.resolve({}) } as unknown as Response;
    }
    return { ok: true, status: 200, json: () => Promise.resolve({}) } as unknown as Response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function fillCardForm() {
  fireEvent.change(screen.getByLabelText('Número do cartão'), {
    target: { value: '4000 0000 0000 0010' },
  });
  fireEvent.change(screen.getByLabelText('Nome impresso no cartão'), {
    target: { value: 'Maria da Silva' },
  });
  fireEvent.change(screen.getByLabelText('Validade'), {
    target: { value: '12/30' },
  });
  fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
}

beforeEach(() => {
  vi.clearAllMocks();
  installCheckoutFetchMock();

  // Reset mock implementations to defaults after clearAllMocks
  mockValidateClientUseCase.mockResolvedValue(undefined);
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
  vi.restoreAllMocks();
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
    fillCardForm();

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
    fillCardForm();

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
    fillCardForm();

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
    fillCardForm();

    // Start submission (do not await)
    fireEvent.click(concluirButton);

    // Once the orchestrator hits the contract stage, the form is replaced by
    // the progress panel — button is removed from DOM (RF7).
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /concluir/i })).not.toBeInTheDocument();
    });

    // Now resolve the contract call
    await act(async () => {
      resolveContract({
        contract_id: 'contract-uuid-1',
        plan_ids: ['plan-uuid-1'],
      });
    });

    // After success, the step-4 success screen is shown
    await waitFor(() => {
      expect(screen.queryByText(/plan-uuid-1/i)).toBeInTheDocument();
    });
  });

  it('should not call clearDraft and should display error panel when contract registration fails', async () => {
    // Override the contract mock for this test to simulate an error
    mockContractExecute.mockRejectedValueOnce(
      new ValidationError({ _form: 'Ocorreu um erro inesperado. Tente novamente.' }),
    );

    renderAtStep3();

    const concluirButton = await screen.findByRole('button', { name: /concluir/i });
    fillCardForm();

    await act(async () => {
      fireEvent.click(concluirButton);
    });

    await waitFor(() => {
      expect(clearDraft).not.toHaveBeenCalled();
      // Error panel renders the "Tentar novamente" button on stage failure
      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    });
  });

  it('should keep user at step 3 with error panel when RegisterClientUseCase fails (stage 3)', async () => {
    mockClientExecute.mockRejectedValueOnce(
      new ValidationError({ _form: 'Erro ao validar cliente.' }),
    );

    renderAtStep3();

    const concluirButton = await screen.findByRole('button', { name: /concluir/i });
    fillCardForm();

    await act(async () => {
      fireEvent.click(concluirButton);
    });

    // The orchestrator surfaces the failure in the progress panel — retry button visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    });
    expect(clearDraft).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// H2 Tests — Passo 0 dry-run validation
// ---------------------------------------------------------------------------

describe('ContratarPageClient — passo 0 dry-run validation', () => {
  it('should call validateClientUseCase when the "Avançar" button is clicked on step 0', async () => {
    vi.mocked(loadDraft).mockReturnValue(null);
    render(<ContratarPageClient />);

    const avancarButton = await screen.findByRole('button', { name: /avançar/i });

    await act(async () => {
      fireEvent.click(avancarButton);
    });

    await waitFor(() => {
      expect(mockValidateClientUseCase).toHaveBeenCalledTimes(1);
    });
  });

  it('should advance to step 1 after validateClientUseCase resolves successfully', async () => {
    mockValidateClientUseCase.mockResolvedValueOnce(undefined);
    vi.mocked(loadDraft).mockReturnValue(null);
    render(<ContratarPageClient />);

    const avancarButton = await screen.findByRole('button', { name: /avançar/i });

    await act(async () => {
      fireEvent.click(avancarButton);
    });

    // Step 1 renders the pets section; check it is shown
    await waitFor(() => {
      // Step 1 button (from StepPets) — "Avançar" or "Próximo" with pets context
      expect(screen.queryByRole('button', { name: /avançar/i })).not.toBeInTheDocument();
    });
  });

  it('should display field error and stay on step 0 when validateClientUseCase throws ValidationError', async () => {
    mockValidateClientUseCase.mockRejectedValueOnce(
      new ValidationError({ phone: 'Telefone inválido. Use DDD + número (10 ou 11 dígitos).' }),
    );
    vi.mocked(loadDraft).mockReturnValue(null);
    render(<ContratarPageClient />);

    const avancarButton = await screen.findByRole('button', { name: /avançar/i });

    await act(async () => {
      fireEvent.click(avancarButton);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Button should be re-enabled (isValidating=false) and user stays on step 0
    expect(avancarButton).not.toBeDisabled();
    expect(screen.getByText(/dados do titular/i)).toBeInTheDocument();
  });

  it('should display _form error when validateClientUseCase throws a non-ValidationError', async () => {
    mockValidateClientUseCase.mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(loadDraft).mockReturnValue(null);
    render(<ContratarPageClient />);

    const avancarButton = await screen.findByRole('button', { name: /avançar/i });

    await act(async () => {
      fireEvent.click(avancarButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/não foi possível validar/i)).toBeInTheDocument();
    });
  });

  it('should disable the "Avançar" button while validateClientUseCase is in progress', async () => {
    let resolveValidation!: () => void;
    const validationPromise = new Promise<void>((resolve) => {
      resolveValidation = resolve;
    });
    mockValidateClientUseCase.mockReturnValueOnce(validationPromise);
    vi.mocked(loadDraft).mockReturnValue(null);
    render(<ContratarPageClient />);

    const avancarButton = await screen.findByRole('button', { name: /avançar/i });

    // Trigger validation (do not await)
    fireEvent.click(avancarButton);

    // Button should be disabled while in-progress
    await waitFor(() => {
      expect(avancarButton).toBeDisabled();
    });

    // Resolve the validation
    await act(async () => {
      resolveValidation();
    });

    // After resolution the step changes and the button exits DOM
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /avançar/i })).not.toBeInTheDocument();
    });
  });

  it('should call validateClientUseCase exactly once when the "Avançar" button is double-clicked rapidly', async () => {
    // Make validation slow so the second click arrives while the first is still in flight
    let resolveValidation!: () => void;
    const validationPromise = new Promise<void>((resolve) => {
      resolveValidation = resolve;
    });
    mockValidateClientUseCase.mockReturnValueOnce(validationPromise);
    vi.mocked(loadDraft).mockReturnValue(null);
    render(<ContratarPageClient />);

    const avancarButton = await screen.findByRole('button', { name: /avançar/i });

    // Two synchronous clicks before React can re-render and disable the button
    fireEvent.click(avancarButton);
    fireEvent.click(avancarButton);

    // Resolve so the async handler can finish cleanly
    await act(async () => {
      resolveValidation();
    });

    // The isValidating guard ensures only one call is made despite two click events
    expect(mockValidateClientUseCase).toHaveBeenCalledTimes(1);
  });
});
