/**
 * Behavior tests for AddPetToClientDialog.
 *
 * Covers:
 * - Passo 1: validation errors (required fields, weight range, future birthDate)
 * - Passo 1 → Passo 2 transition on valid data
 * - Submit disabled until the "tutor está ciente" checkbox is checked
 * - Error mapping: 422 per `reason`, 409 (name collision → back to step 1,
 *   inline error), 502/network → generic banner with retry
 * - Idempotency-Key stability across a submit + retry
 * - Success: calls onAdded and closes the dialog
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AddPetToClientDialog } from './add-pet-to-client-dialog';
import type { AddPetToClientResult } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetchResponse(body: unknown, status = 201): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

function getForm(formId: string): HTMLFormElement {
  const form = document.getElementById(formId) as HTMLFormElement | null;
  if (!form) throw new Error(`Form #${formId} not found in document`);
  return form;
}

async function fillValidStep1(): Promise<void> {
  fireEvent.change(screen.getByLabelText(/^nome/i), { target: { value: 'Rex' } });
  fireEvent.change(screen.getByLabelText(/^raça/i), { target: { value: 'Golden' } });
  fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: '25' } });
  fireEvent.change(screen.getByLabelText(/data de nascimento/i), {
    target: { value: '2021-01-01' },
  });
  await act(async () => {
    fireEvent.submit(getForm('add-pet-form'));
  });
}

const RESULT: AddPetToClientResult = {
  petId: 'pet-new-1',
  planId: 'plan-new-1',
  nextBillingAt: '2026-08-01T00:00:00.000Z',
  nextBillingAmountCents: 7500,
  coverageStartsAt: '2026-08-01T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  vi.stubGlobal('confirm', vi.fn(() => true));
  // jsdom does not implement crypto.randomUUID by default in older setups;
  // ensure a stable, real UUID generator is available.
  if (!globalThis.crypto?.randomUUID) {
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid-stub' });
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Passo 1 — validation
// ---------------------------------------------------------------------------

describe('AddPetToClientDialog — Passo 1 validation', () => {
  it('should show validation errors when submitting the empty form', async () => {
    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await act(async () => {
      fireEvent.submit(getForm('add-pet-form'));
    });

    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/raça é obrigatória/i)).toBeInTheDocument();
    expect(screen.getByText(/peso deve estar entre/i)).toBeInTheDocument();
    expect(screen.getByText(/data de nascimento é obrigatória/i)).toBeInTheDocument();

    // Still on step 1 — step 2 fields are not rendered
    expect(screen.queryByLabelText(/tutor está ciente/i)).not.toBeInTheDocument();
  });

  it('should show a validation error when weight is out of range', async () => {
    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    fireEvent.change(screen.getByLabelText(/peso/i), { target: { value: '200' } });

    await act(async () => {
      fireEvent.submit(getForm('add-pet-form'));
    });

    expect(screen.getByText(/peso deve estar entre/i)).toBeInTheDocument();
  });

  it('should show a validation error when birthDate is in the future', async () => {
    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    fireEvent.change(screen.getByLabelText(/data de nascimento/i), {
      target: { value: '2099-01-01' },
    });

    await act(async () => {
      fireEvent.submit(getForm('add-pet-form'));
    });

    expect(screen.getByText(/deve estar no passado/i)).toBeInTheDocument();
  });

  it('should advance to step 2 when all fields are valid', async () => {
    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await fillValidStep1();

    expect(screen.getByLabelText(/tutor está ciente/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Passo 2 — submit disabled without checkbox
// ---------------------------------------------------------------------------

describe('AddPetToClientDialog — Passo 2 submit gating', () => {
  it('should keep "Confirmar adição" disabled until the checkbox is checked', async () => {
    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await fillValidStep1();

    const confirmButton = screen.getByRole('button', { name: /confirmar adição/i });
    expect(confirmButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/tutor está ciente/i));

    expect(confirmButton).toBeEnabled();
  });

  it('should not call fetch when clicking a disabled confirm button', async () => {
    const mockFetch = vi.mocked(fetch);

    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await fillValidStep1();

    fireEvent.click(screen.getByRole('button', { name: /confirmar adição/i }));

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Submit — happy path
// ---------------------------------------------------------------------------

describe('AddPetToClientDialog — submit happy path', () => {
  it('should POST to the internal route with a stable Idempotency-Key and call onAdded on success', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(RESULT, 201));

    const onAdded = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={onOpenChange}
        onAdded={onAdded}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await fillValidStep1();
    fireEvent.click(screen.getByLabelText(/tutor está ciente/i));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar adição/i }));
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce());

    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toBe('/api/admin/clients/client-1/pets');
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers['Idempotency-Key']).toBeTruthy();

    expect(onAdded).toHaveBeenCalledWith(RESULT);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should reuse the same Idempotency-Key on a retry after a failed submit', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch
      .mockResolvedValueOnce(
        makeFetchResponse({ code: 'PROVIDER_UPSTREAM', message: 'Falha upstream' }, 502),
      )
      .mockResolvedValueOnce(makeFetchResponse(RESULT, 201));

    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await fillValidStep1();
    fireEvent.click(screen.getByLabelText(/tutor está ciente/i));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar adição/i }));
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    // Retry
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

    const firstKey = (
      (mockFetch.mock.calls[0][1] as RequestInit).headers as Record<string, string>
    )['Idempotency-Key'];
    const secondKey = (
      (mockFetch.mock.calls[1][1] as RequestInit).headers as Record<string, string>
    )['Idempotency-Key'];

    expect(firstKey).toBe(secondKey);
  });
});

// ---------------------------------------------------------------------------
// Error mapping — 422 per reason
// ---------------------------------------------------------------------------

describe('AddPetToClientDialog — 422 error mapping by reason', () => {
  it.each([
    [
      'client_inadimplente',
      /cobrança em aberto/i,
    ],
    [
      'client_pendente',
      /aguarde a primeira cobrança/i,
    ],
    [
      'client_no_subscription',
      /não possui uma assinatura ativa/i,
    ],
  ])('should show the correct message for reason=%s', async (reason, expected) => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'CLIENT_NOT_ELIGIBLE_FOR_PET_ADDITION', reason },
        422,
      ),
    );

    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await fillValidStep1();
    fireEvent.click(screen.getByLabelText(/tutor está ciente/i));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar adição/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(expected);
    });
  });
});

// ---------------------------------------------------------------------------
// Error mapping — 409 name collision
// ---------------------------------------------------------------------------

describe('AddPetToClientDialog — 409 name collision', () => {
  it('should go back to step 1 and show an inline error on the name field', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'INVALID_INPUT', message: 'Já existe um pet com esse nome para este cliente.' },
        409,
      ),
    );

    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await fillValidStep1();
    fireEvent.click(screen.getByLabelText(/tutor está ciente/i));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar adição/i }));
    });

    await waitFor(() => {
      // Back on step 1 — the name input is visible again
      expect(screen.getByLabelText(/^nome/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/já existe um pet com esse nome/i),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Error mapping — 502 / network
// ---------------------------------------------------------------------------

describe('AddPetToClientDialog — 502 / network errors', () => {
  it('should show a generic banner on 502 with a retry option', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'PROVIDER_UPSTREAM', message: 'Pagar.me indisponível.' }, 502),
    );

    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await fillValidStep1();
    fireEvent.click(screen.getByLabelText(/tutor está ciente/i));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar adição/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/pagar\.me indisponível/i);
    });
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it('should show a generic connection-error banner when fetch rejects', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error('network down'));

    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    await fillValidStep1();
    fireEvent.click(screen.getByLabelText(/tutor está ciente/i));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirmar adição/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/erro de conexão/i);
    });
  });
});

// ---------------------------------------------------------------------------
// Esc key with dirty form
// ---------------------------------------------------------------------------

describe('AddPetToClientDialog — Esc key handling', () => {
  it('should prompt confirmation before closing when step 1 has data and user presses Esc', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(false);

    const onOpenChange = vi.fn();

    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={onOpenChange}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    fireEvent.change(screen.getByLabelText(/^nome/i), { target: { value: 'Rex' } });

    const dialogContent = screen.getByLabelText(/^nome/i).closest('[role="dialog"]') as HTMLElement;
    act(() => {
      fireEvent.keyDown(dialogContent, { key: 'Escape' });
    });

    expect(mockConfirm).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('should close without prompting when the form is untouched and user presses Esc', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    const onOpenChange = vi.fn();

    render(
      <AddPetToClientDialog
        clientId="client-1"
        open={true}
        onOpenChange={onOpenChange}
        onAdded={vi.fn()}
        currentLivePlanCount={1}
        pricePerPetCents={2500}
        contractText=""
      />,
    );

    const dialogContent = screen.getByLabelText(/^nome/i).closest('[role="dialog"]') as HTMLElement;
    act(() => {
      fireEvent.keyDown(dialogContent, { key: 'Escape' });
    });

    expect(mockConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
