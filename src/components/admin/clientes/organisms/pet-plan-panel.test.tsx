/**
 * Behavior tests for PetPlanPanel — deactivation feature (Task 5.0).
 *
 * Covers:
 * - should show deactivate button when pet has no plans
 * - should not show deactivate button when pet has plans
 * - should open AlertDialog on deactivate button click
 * - should call onDeactivated on success
 * - should show inline error on PetHasPlansError
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { PetPlanPanel } from './pet-plan-panel';
import type { PetListItem } from '@/lib/types/client';
import type { PlanListItem } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/link to avoid navigation in jsdom.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock the deactivate use case so we control outcomes.
vi.mock('@/domain/pet/deactivate-pet.use-case', () => {
  class PetHasPlansError extends Error {
    readonly code = 'PET_HAS_PLANS';
    readonly status = 409;
    constructor(message = 'Este pet possui planos associados e não pode ser inativado.') {
      super(message);
      this.name = 'PetHasPlansError';
    }
  }

  return {
    deactivatePetUseCase: vi.fn(),
    PetHasPlansError,
    ApiNotFoundError: class ApiNotFoundError extends Error {
      constructor(msg?: string) { super(msg); this.name = 'ApiNotFoundError'; }
    },
  };
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockPet: PetListItem = {
  id: 'pet-1',
  name: 'Rex',
  species: 'canino',
  breed: 'Labrador',
  birthDate: '2020-05-10T00:00:00.000Z',
  sex: 'male',
  weight: 25,
  castrated: false,
  createdAt: '2022-01-10T10:00:00.000Z',
};

const activePlan: PlanListItem = {
  id: 'plan-1',
  status: 'ativo',
  clientId: 'client-1',
  clientName: 'Maria Oliveira',
  petId: 'pet-1',
  petName: 'Rex',
  createdAt: '2024-01-15T10:00:00.000Z',
};

const cancelledPlan: PlanListItem = {
  ...activePlan,
  id: 'plan-old',
  status: 'cancelado',
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Stub global fetch for lazy plan detail and usages count — both fail gracefully.
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPanel(
  planItems: PlanListItem[] = [],
  onDeactivated?: () => void,
) {
  return render(
    <PetPlanPanel
      pet={mockPet}
      clientId="client-1"
      allPlans={planItems}
      clientName="Maria Oliveira"
      onDeactivated={onDeactivated}
    />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PetPlanPanel — deactivation button visibility', () => {
  it('should show deactivate button when pet has no plans', () => {
    renderPanel([]);

    expect(
      screen.getByTestId('deactivate-pet-button'),
    ).toBeInTheDocument();
  });

  it('should not show deactivate button when pet has plans', () => {
    renderPanel([activePlan]);

    expect(
      screen.queryByTestId('deactivate-pet-button'),
    ).not.toBeInTheDocument();
  });

  it('should not show deactivate button when pet has only cancelled plans', () => {
    renderPanel([cancelledPlan]);

    expect(
      screen.queryByTestId('deactivate-pet-button'),
    ).not.toBeInTheDocument();
  });
});

describe('PetPlanPanel — AlertDialog interactions', () => {
  it('should open AlertDialog on deactivate button click', async () => {
    renderPanel([]);

    act(() => {
      fireEvent.click(screen.getByTestId('deactivate-pet-button'));
    });

    await waitFor(() => {
      // AlertDialog title should be visible
      expect(
        screen.getByRole('alertdialog'),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(`Inativar ${mockPet.name}?`),
    ).toBeInTheDocument();
  });

  it('should close AlertDialog when Cancelar is clicked', async () => {
    renderPanel([]);

    act(() => {
      fireEvent.click(screen.getByTestId('deactivate-pet-button'));
    });

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(screen.getByText('Cancelar'));
    });

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});

describe('PetPlanPanel — deactivation happy path', () => {
  it('should call onDeactivated on success', async () => {
    const { deactivatePetUseCase } = await import('@/domain/pet/deactivate-pet.use-case');
    vi.mocked(deactivatePetUseCase).mockResolvedValueOnce(undefined);

    const onDeactivated = vi.fn();
    renderPanel([], onDeactivated);

    // Open dialog
    act(() => {
      fireEvent.click(screen.getByTestId('deactivate-pet-button'));
    });

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    // Confirm
    act(() => {
      fireEvent.click(screen.getByTestId('confirm-deactivate-button'));
    });

    await waitFor(() => {
      expect(onDeactivated).toHaveBeenCalledTimes(1);
    });
  });
});

describe('PetPlanPanel — deactivation error handling', () => {
  it('should show inline error on PetHasPlansError', async () => {
    const { deactivatePetUseCase, PetHasPlansError } = await import(
      '@/domain/pet/deactivate-pet.use-case'
    );
    vi.mocked(deactivatePetUseCase).mockRejectedValueOnce(
      new PetHasPlansError(),
    );

    renderPanel([]);

    // Open dialog
    act(() => {
      fireEvent.click(screen.getByTestId('deactivate-pet-button'));
    });

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    // Confirm
    act(() => {
      fireEvent.click(screen.getByTestId('confirm-deactivate-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('deactivate-inline-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('deactivate-inline-error')).toHaveTextContent(
      'Este pet possui planos associados e não pode ser inativado.',
    );
  });

  it('should show generic inline error on unexpected errors', async () => {
    const { deactivatePetUseCase } = await import('@/domain/pet/deactivate-pet.use-case');
    vi.mocked(deactivatePetUseCase).mockRejectedValueOnce(
      new Error('Network error'),
    );

    renderPanel([]);

    act(() => {
      fireEvent.click(screen.getByTestId('deactivate-pet-button'));
    });

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(screen.getByTestId('confirm-deactivate-button'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('deactivate-inline-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('deactivate-inline-error')).toHaveTextContent(
      'Ocorreu um erro ao inativar o pet. Tente novamente.',
    );
  });
});
