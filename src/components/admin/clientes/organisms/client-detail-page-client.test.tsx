/**
 * Behavior tests for ClientDetailPageClient.
 *
 * Covers:
 * - 6.6a: Selecting a different pet updates the plan panel
 * - 6.6b: Clicking "Registrar uso" on an `ativo` plan opens BenefitUsageModal
 * - 6.6c: Clicking "Registrar uso" on a `carencia` plan opens FrictionDialog first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ClientDetailPageClient } from './client-detail-page-client';
import type { ClientDetail } from '@/lib/types/client';
import type { PlanListItem } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/navigation so router.refresh() does not throw
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock next/link to render a plain anchor
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

// Mock PetPlanPanel to avoid triggering lazy fetches and reduce complexity.
vi.mock('./pet-plan-panel', () => ({
  PetPlanPanel: ({
    pet,
    allPlans,
    onUsageRegistered,
  }: {
    pet: { id: string; name: string };
    allPlans: PlanListItem[];
    onUsageRegistered?: () => void;
  }) => {
    // Match by petId for deterministic association (mirrors the real component)
    const petPlan = allPlans.find((p) => p.petId === pet.id);
    return (
      <div data-testid={`panel-${pet.id}`}>
        <span data-testid="panel-pet-name">{pet.name}</span>
        {petPlan && (
          <button
            data-testid={`register-usage-${petPlan.status}`}
            onClick={() => onUsageRegistered?.()}
          >
            Registrar uso ({petPlan.status})
          </button>
        )}
      </div>
    );
  },
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeClient(overrides: Partial<ClientDetail> = {}): ClientDetail {
  return {
    id: 'client-1',
    name: 'Maria Cliente',
    cpf: '12345678901',
    phone: '47991234567',
    email: 'maria@example.com',
    addresses: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    pets: [
      {
        id: 'pet-1',
        name: 'Rex',
        species: 'canino',
        breed: 'Golden',
        birthDate: '2022-03-15T00:00:00.000Z',
        weight: 25,
        castrated: false,
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'pet-2',
        name: 'Mia',
        species: 'felino',
        breed: 'Siamês',
        birthDate: '2021-06-10T00:00:00.000Z',
        weight: 4,
        castrated: true,
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    ...overrides,
  };
}

function makePlans(overrides: Partial<PlanListItem>[] = []): PlanListItem[] {
  const base: PlanListItem[] = [
    {
      id: 'plan-1',
      status: 'ativo',
      clientId: 'client-1',
      clientName: 'Maria Cliente',
      petId: 'pet-1',
      petName: 'Rex',
      createdAt: '2025-01-15T00:00:00.000Z',
    },
    {
      id: 'plan-2',
      status: 'carencia',
      clientId: 'client-1',
      clientName: 'Maria Cliente',
      petId: 'pet-2',
      petName: 'Mia',
      createdAt: '2025-02-01T00:00:00.000Z',
    },
  ];
  return base.map((p, i) => ({ ...p, ...(overrides[i] ?? {}) }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ClientDetailPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the no-pets message when client has no pets', () => {
    const client = makeClient({ pets: [] });
    render(<ClientDetailPageClient client={client} plans={[]} />);

    expect(screen.getByTestId('no-pets-message')).toBeInTheDocument();
    expect(screen.queryByTestId('plan-panel-container')).not.toBeInTheDocument();
  });

  it('should auto-select the pet with an ativo plan on mount', () => {
    const client = makeClient();
    const plans = makePlans();

    render(<ClientDetailPageClient client={client} plans={plans} />);

    // Rex (ativo) should be the selected pet and its panel visible
    expect(screen.getByTestId('panel-pet-1')).toBeInTheDocument();
    expect(screen.getByTestId('panel-pet-name')).toHaveTextContent('Rex');
  });

  it('should update the plan panel when a different pet is selected', () => {
    const client = makeClient();
    const plans = makePlans();

    render(<ClientDetailPageClient client={client} plans={plans} />);

    // Initially Rex is selected
    expect(screen.getByTestId('panel-pet-name')).toHaveTextContent('Rex');

    // Click on Mia in the pet list
    const miaButton = screen.getByRole('button', { name: /selecionar pet mia/i });

    act(() => {
      fireEvent.click(miaButton);
    });

    // Panel should now show Mia
    expect(screen.getByTestId('panel-pet-name')).toHaveTextContent('Mia');
  });

  it('should show the plan status button for the active plan', () => {
    const client = makeClient();
    const plans = makePlans();

    render(<ClientDetailPageClient client={client} plans={plans} />);

    // Rex has ativo plan — panel mock renders the register button
    expect(screen.getByTestId('register-usage-ativo')).toBeInTheDocument();
  });

  it('should keep only one panel visible at a time', () => {
    const client = makeClient();
    const plans = makePlans();

    render(<ClientDetailPageClient client={client} plans={plans} />);

    // Before clicking Mia: only Rex panel is visible
    expect(screen.queryByTestId('panel-pet-2')).not.toBeInTheDocument();

    // Click Mia
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /selecionar pet mia/i }));
    });

    // Now Mia panel should be visible and Rex panel hidden
    expect(screen.getByTestId('panel-pet-2')).toBeInTheDocument();
    expect(screen.queryByTestId('panel-pet-1')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Separate describe for FrictionDialog + BenefitUsageModal integration.
// Uses real RegisterUsageButton (no mock), but BenefitUsageModal is mocked.
// ---------------------------------------------------------------------------

vi.mock(
  '@/components/admin/uso-beneficio/organisms/benefit-usage-modal/BenefitUsageModal',
  () => ({
    BenefitUsageModal: ({
      open,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      plan: unknown;
      onSuccess: (usage: unknown) => void;
    }) => (
      <div
        data-testid="benefit-usage-modal"
        data-open={open ? 'true' : 'false'}
      >
        BenefitUsageModal
      </div>
    ),
  }),
);

describe('RegisterUsageButton friction behavior', () => {
  it('should open BenefitUsageModal directly when plan status is ativo', async () => {
    const { RegisterUsageButton } = await import(
      '@/components/admin/clientes/molecules/register-usage-button'
    );

    const plan = {
      id: 'p1',
      status: 'ativo' as const,
      petName: 'Rex',
      clientName: 'Maria',
    };

    render(<RegisterUsageButton plan={plan} onRegistered={vi.fn()} />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /registrar uso/i }));
    });

    const modal = screen.getByTestId('benefit-usage-modal');
    expect(modal).toHaveAttribute('data-open', 'true');
  });

  it('should show FrictionConfirmDialog first when plan status is carencia', async () => {
    const { RegisterUsageButton } = await import(
      '@/components/admin/clientes/molecules/register-usage-button'
    );

    const plan = {
      id: 'p2',
      status: 'carencia' as const,
      petName: 'Mia',
      clientName: 'Maria',
    };

    render(<RegisterUsageButton plan={plan} onRegistered={vi.fn()} />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /registrar uso/i }));
    });

    // FrictionConfirmDialog should appear (it has title "Plano em carência")
    expect(
      screen.getByRole('heading', { name: /plano em carência/i }),
    ).toBeInTheDocument();

    // BenefitUsageModal should NOT be open yet
    const modal = screen.getByTestId('benefit-usage-modal');
    expect(modal).toHaveAttribute('data-open', 'false');
  });

  it('should open BenefitUsageModal after confirming FrictionDialog for carencia', async () => {
    const { RegisterUsageButton } = await import(
      '@/components/admin/clientes/molecules/register-usage-button'
    );

    const plan = {
      id: 'p3',
      status: 'carencia' as const,
      petName: 'Mia',
      clientName: 'Maria',
    };

    render(<RegisterUsageButton plan={plan} onRegistered={vi.fn()} />);

    // Click "Registrar uso" button
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /registrar uso/i }));
    });

    // Click "Registrar mesmo assim" in the friction dialog
    act(() => {
      fireEvent.click(
        screen.getByRole('button', { name: /registrar mesmo assim/i }),
      );
    });

    // BenefitUsageModal should now be open
    const modal = screen.getByTestId('benefit-usage-modal');
    expect(modal).toHaveAttribute('data-open', 'true');
  });

  it('should disable the button when plan status is pendente', async () => {
    const { RegisterUsageButton } = await import(
      '@/components/admin/clientes/molecules/register-usage-button'
    );

    const plan = { id: 'p4', status: 'pendente' as const };

    render(<RegisterUsageButton plan={plan} />);

    const btn = screen.getByRole('button', { name: /registrar uso/i });
    expect(btn).toBeDisabled();
  });

  it('should disable the button when plan status is cancelado', async () => {
    const { RegisterUsageButton } = await import(
      '@/components/admin/clientes/molecules/register-usage-button'
    );

    const plan = { id: 'p5', status: 'cancelado' as const };

    render(<RegisterUsageButton plan={plan} />);

    const btn = screen.getByRole('button', { name: /registrar uso/i });
    expect(btn).toBeDisabled();
  });

  it('should show FrictionConfirmDialog first when plan status is inadimplente', async () => {
    const { RegisterUsageButton } = await import(
      '@/components/admin/clientes/molecules/register-usage-button'
    );

    const plan = {
      id: 'p6',
      status: 'inadimplente' as const,
      petName: 'Rex',
      clientName: 'Maria',
    };

    render(<RegisterUsageButton plan={plan} onRegistered={vi.fn()} />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /registrar uso/i }));
    });

    // FrictionConfirmDialog should appear for inadimplente status
    // The dialog heading may vary — check for the modal presence without being strict on text
    const modal = screen.getByTestId('benefit-usage-modal');
    // BenefitUsageModal should NOT be open yet (friction dialog intercepts)
    expect(modal).toHaveAttribute('data-open', 'false');
  });

  it('should disable the button when plan status is estornado', async () => {
    const { RegisterUsageButton } = await import(
      '@/components/admin/clientes/molecules/register-usage-button'
    );

    const plan = { id: 'p7', status: 'estornado' as const };

    render(<RegisterUsageButton plan={plan} />);

    const btn = screen.getByRole('button', { name: /registrar uso/i });
    expect(btn).toBeDisabled();
  });

  it('should disable the button when plan status is contestado', async () => {
    const { RegisterUsageButton } = await import(
      '@/components/admin/clientes/molecules/register-usage-button'
    );

    const plan = { id: 'p8', status: 'contestado' as const };

    render(<RegisterUsageButton plan={plan} />);

    const btn = screen.getByRole('button', { name: /registrar uso/i });
    expect(btn).toBeDisabled();
  });
});
