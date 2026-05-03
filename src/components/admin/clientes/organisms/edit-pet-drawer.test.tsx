/**
 * Behavior tests for EditPetDrawer.
 *
 * Covers:
 * - Submit happy path → fetch called with correct payload, onSaved called, drawer closes
 * - Validation errors → weight, birthDate
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
import { EditPetDrawer } from './edit-pet-drawer';
import type { PetDetail } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PET: PetDetail = {
  id: 'pet-1',
  clientId: 'client-1',
  name: 'Rex',
  species: 'canino',
  breed: 'Golden Retriever',
  birthDate: '2020-05-10T00:00:00.000Z',
  sex: 'male',
  weight: 32.5,
  castrated: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
};

const UPDATED_PET: PetDetail = {
  ...PET,
  name: 'Rex Atualizado',
  weight: 34.0,
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

describe('EditPetDrawer', () => {
  it('should render the form fields when open', () => {
    render(
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/peso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/castrado/i)).toBeInTheDocument();
  });

  it('should pre-fill form with pet data', () => {
    render(
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/nome/i)).toHaveValue('Rex');
    expect(screen.getByLabelText(/peso/i)).toHaveValue(32.5);
    expect(screen.getByLabelText(/data de nascimento/i)).toHaveValue('2020-05-10');
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  it('should call fetch PATCH and close the drawer on success', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(UPDATED_PET, 200));

    const onSaved = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
        open={true}
        onOpenChange={onOpenChange}
        onSaved={onSaved}
      />,
    );

    await act(async () => {
      fireEvent.submit(getForm('edit-pet-form'));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain(`/api/admin/clients/client-1/pets/${PET.id}`);
    expect((init as RequestInit).method).toBe('PATCH');

    expect(onSaved).toHaveBeenCalledWith(UPDATED_PET);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should include correct species and sex values in the payload', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(UPDATED_PET, 200));

    render(
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.submit(getForm('edit-pet-form'));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.species).toBe('canino');
    expect(body.sex).toBe('male');
  });

  // -------------------------------------------------------------------------
  // Validation errors
  // -------------------------------------------------------------------------

  it('should show validation error when weight is out of range', async () => {
    render(
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    const weightInput = screen.getByLabelText(/peso/i);
    fireEvent.change(weightInput, { target: { value: '200' } });

    await act(async () => {
      fireEvent.submit(getForm('edit-pet-form'));
    });

    expect(screen.getByText(/peso deve estar entre/i)).toBeInTheDocument();
  });

  it('should show validation error when birthDate is in the future', async () => {
    render(
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    const birthDateInput = screen.getByLabelText(/data de nascimento/i);
    // Set a future date
    fireEvent.change(birthDateInput, { target: { value: '2099-01-01' } });

    await act(async () => {
      fireEvent.submit(getForm('edit-pet-form'));
    });

    expect(screen.getByText(/deve estar no passado/i)).toBeInTheDocument();
  });

  it('should show validation error when name is empty', async () => {
    render(
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
        open={true}
        onOpenChange={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    const nameInput = screen.getByLabelText(/nome/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    await act(async () => {
      fireEvent.submit(getForm('edit-pet-form'));
    });

    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Esc key with dirty form
  // -------------------------------------------------------------------------

  it('should prompt confirmation before closing when form is dirty and user presses Esc', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(false); // user declines discard

    const onOpenChange = vi.fn();

    render(
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
        open={true}
        onOpenChange={onOpenChange}
        onSaved={vi.fn()}
      />,
    );

    // Make the form dirty
    const nameInput = screen.getByLabelText(/nome/i);
    fireEvent.change(nameInput, { target: { value: 'Alterado' } });

    const sheetContent = nameInput.closest('[aria-modal]') as HTMLElement;
    act(() => {
      fireEvent.keyDown(sheetContent, { key: 'Escape' });
    });

    expect(mockConfirm).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('should close when form is dirty and user confirms discard via Esc', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(true); // user accepts discard

    const onOpenChange = vi.fn();

    render(
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
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
      <EditPetDrawer
        pet={PET}
        clientId="client-1"
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
