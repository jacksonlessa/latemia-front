/**
 * Behavior tests for EditClientDrawer.
 *
 * Covers:
 * - Submit happy path → fetch called with correct payload, onSaved called, drawer closes
 * - 409 CLIENT_EMAIL_TAKEN → inline error on email field, drawer remains open
 * - Esc key with dirty form → shows browser confirm, cancels close if user declines
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { EditClientDrawer } from './edit-client-drawer';
import type { ClientDetail } from '@/lib/types/client';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLIENT: ClientDetail = {
  id: 'client-1',
  name: 'Maria da Silva',
  cpf: '52998224725',
  phone: '47991234567',
  email: 'maria@example.com',
  addresses: [
    {
      id: 'addr-1',
      cep: '88010000',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 4',
      city: 'Florianópolis',
      state: 'SC',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  pets: [],
  createdAt: '2024-01-01T00:00:00.000Z',
};

const UPDATED_CLIENT: ClientDetail = {
  ...CLIENT,
  name: 'Maria Atualizada',
  email: 'maria.nova@example.com',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  // Default: window.confirm returns true (user confirms discard)
  vi.stubGlobal('confirm', vi.fn(() => true));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

/** Helper: find the <form> element by id in the document (works inside portals). */
function getForm(formId: string): HTMLFormElement {
  const form = document.getElementById(formId) as HTMLFormElement | null;
  if (!form) throw new Error(`Form #${formId} not found in document`);
  return form;
}

describe('EditClientDrawer', () => {
  it('should render the form fields when open', () => {
    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
  });

  it('should render CPF as read-only', () => {
    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    const cpfInput = screen.getByLabelText(/cpf/i);
    expect(cpfInput).toBeDisabled();
    expect(cpfInput).toHaveAttribute('aria-readonly', 'true');
  });

  it('should pre-fill form with client data', () => {
    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/nome/i)).toHaveValue('Maria da Silva');
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('maria@example.com');
    expect(screen.getByLabelText(/telefone/i)).toHaveValue('47991234567');
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  it('should call fetch with PATCH and close the drawer on success', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(UPDATED_CLIENT, 200));

    const onSaved = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={onOpenChange}
        onSaved={onSaved}
      />,
    );

    // Submit the form by id (Sheet renders in a Radix Portal)
    await act(async () => {
      fireEvent.submit(getForm('edit-client-form'));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, init] = mockFetch.mock.calls[0];
      expect(String(url)).toContain(`/api/admin/clients/${CLIENT.id}`);
      expect((init as RequestInit).method).toBe('PATCH');
    });

    expect(onSaved).toHaveBeenCalledWith(UPDATED_CLIENT);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show inline email error when backend returns 409 CLIENT_EMAIL_TAKEN', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'CLIENT_EMAIL_TAKEN', message: 'E-mail já em uso.' },
        409,
      ),
    );

    const onSaved = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={onOpenChange}
        onSaved={onSaved}
      />,
    );

    await act(async () => {
      fireEvent.submit(getForm('edit-client-form'));
    });

    await waitFor(() => {
      expect(
        screen.getByText(/este e-mail já está em uso/i),
      ).toBeInTheDocument();
    });

    // Drawer must remain open
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('should display email error near the email field (aria-describedby)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        { code: 'CLIENT_EMAIL_TAKEN', message: 'E-mail já em uso.' },
        409,
      ),
    );

    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.submit(getForm('edit-client-form'));
    });

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/e-mail/i);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  // -------------------------------------------------------------------------
  // Validation errors
  // -------------------------------------------------------------------------

  it('should show client-side validation error when name is cleared', async () => {
    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    const nameInput = screen.getByLabelText(/nome/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    await act(async () => {
      fireEvent.submit(getForm('edit-client-form'));
    });

    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
  });

  it('should show client-side validation error for invalid email format', async () => {
    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    const emailInput = screen.getByLabelText(/e-mail/i);
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

    await act(async () => {
      fireEvent.submit(getForm('edit-client-form'));
    });

    expect(screen.getByText(/formato de e-mail inválido/i)).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Esc key with dirty form
  // -------------------------------------------------------------------------

  it('should prompt confirmation before closing when form is dirty and user presses Esc', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(false); // user declines discard

    const onOpenChange = vi.fn();

    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={onOpenChange}
        onSaved={vi.fn()}
      />,
    );

    // Make the form dirty
    const nameInput = screen.getByLabelText(/nome/i);
    fireEvent.change(nameInput, { target: { value: 'Alterado' } });

    // Press Escape
    const sheetContent = nameInput.closest('[aria-modal]') as HTMLElement;
    act(() => {
      fireEvent.keyDown(sheetContent, { key: 'Escape' });
    });

    expect(mockConfirm).toHaveBeenCalled();
    // Since user declined, drawer should NOT close
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('should close when form is dirty and user confirms discard via Esc', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(true); // user accepts discard

    const onOpenChange = vi.fn();

    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={onOpenChange}
        onSaved={vi.fn()}
      />,
    );

    const nameInput = screen.getByLabelText(/nome/i);
    fireEvent.change(nameInput, { target: { value: 'Alterado' } });

    const sheetContent = nameInput.closest('[aria-modal]') as HTMLElement;
    act(() => {
      fireEvent.keyDown(sheetContent, { key: 'Escape' });
    });

    expect(mockConfirm).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should close without prompt when form is clean and user presses Esc', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    const onOpenChange = vi.fn();

    render(
      <EditClientDrawer
        client={CLIENT}
        open={true}
        onOpenChange={onOpenChange}
        onSaved={vi.fn()}
      />,
    );

    const nameInput = screen.getByLabelText(/nome/i);
    const sheetContent = nameInput.closest('[aria-modal]') as HTMLElement;

    act(() => {
      fireEvent.keyDown(sheetContent, { key: 'Escape' });
    });

    expect(mockConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
