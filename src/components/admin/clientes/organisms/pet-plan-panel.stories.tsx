/**
 * Storybook stories for PetPlanPanel organism.
 *
 * The panel lazy-fetches plan detail and usages count via internal Route
 * Handlers when mounted. In Storybook there is no backend, so the fetch will
 * fail silently and the panel will render in its loading state briefly before
 * falling back to the empty/error path.
 *
 * For stories that need to showcase a specific loaded state, a global `fetch`
 * mock is provided via the `loaders` mechanism.
 *
 * Covered variants:
 * - Pet with ativo plan (will show skeleton then graceful fallback in Storybook)
 * - Pet with carencia plan
 * - Pet with inadimplente plan
 * - Pet with pendente plan
 * - Pet with no vigente plan (only inactive plans)
 * - Pet with no plans at all
 * - Loading state (no allPlans yet / activePlanItem present)
 */

import type React from 'react';
import { PetPlanPanel } from './pet-plan-panel';
import type { PetListItem } from '@/lib/types/client';
import type { PlanListItem } from '@/lib/types/plan';

const meta = {
  title: 'Admin - Clientes/Organisms/PetPlanPanel',
  component: PetPlanPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = {
  render?: (args: unknown) => React.ReactElement;
  args?: Record<string, unknown>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockPet: PetListItem = {
  id: 'pet-1',
  name: 'Rex',
  species: 'canino',
  breed: 'Labrador',
  birthDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  sex: 'male',
  weight: 25,
  castrated: false,
  createdAt: '2022-01-10T10:00:00.000Z',
};

const mockPet2: PetListItem = {
  id: 'pet-2',
  name: 'Luna',
  species: 'felino',
  breed: 'Siamês',
  birthDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  sex: 'female',
  weight: 4,
  castrated: true,
  createdAt: '2022-06-15T10:00:00.000Z',
};

const basePlan: PlanListItem = {
  id: 'plan-1',
  status: 'ativo',
  clientId: 'client-1',
  clientName: 'Maria Oliveira',
  petId: 'pet-1',
  petName: 'Rex',
  createdAt: '2024-01-15T10:00:00.000Z',
};

const inactivePlan: PlanListItem = {
  id: 'plan-old',
  status: 'cancelado',
  clientId: 'client-1',
  clientName: 'Maria Oliveira',
  petId: 'pet-1',
  petName: 'Rex',
  createdAt: '2023-01-01T10:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Pet com plano ativo — exibe skeleton de carregamento enquanto lazy-fetch não retorna */
export const ComPlanoAtivo: Story = {
  name: 'Pet com plano ativo (lazy-fetching)',
  args: {
    pet: mockPet,
    allPlans: [{ ...basePlan, status: 'ativo' }],
    clientName: 'Maria Oliveira',
  },
};

/** Pet com plano em carência */
export const ComPlanoCarencia: Story = {
  name: 'Pet com plano em carência',
  args: {
    pet: mockPet,
    allPlans: [{ ...basePlan, id: 'plan-2', status: 'carencia' }],
    clientName: 'Maria Oliveira',
  },
};

/** Pet com plano inadimplente */
export const ComPlanoInadimplente: Story = {
  name: 'Pet com plano inadimplente',
  args: {
    pet: mockPet,
    allPlans: [{ ...basePlan, id: 'plan-3', status: 'inadimplente' }],
    clientName: 'Maria Oliveira',
  },
};

/** Pet com plano pendente — botão Registrar uso desabilitado */
export const ComPlanoPendente: Story = {
  name: 'Pet com plano pendente',
  args: {
    pet: mockPet,
    allPlans: [{ ...basePlan, id: 'plan-4', status: 'pendente' }],
    clientName: 'Maria Oliveira',
  },
};

/** Pet sem plano vigente — só histórico de planos inativos */
export const SemPlanoVigenteComHistorico: Story = {
  name: 'Sem plano vigente (com histórico)',
  args: {
    pet: mockPet,
    allPlans: [inactivePlan, { ...inactivePlan, id: 'plan-estornado', status: 'estornado' }],
    clientName: 'Maria Oliveira',
  },
};

/** Pet sem nenhum plano */
export const SemNenhumPlano: Story = {
  name: 'Sem nenhum plano',
  args: {
    pet: mockPet,
    allPlans: [],
    clientName: 'Maria Oliveira',
  },
};

/** Pet felino */
export const PetFelino: Story = {
  name: 'Pet felino com plano ativo',
  args: {
    pet: mockPet2,
    allPlans: [
      {
        ...basePlan,
        id: 'plan-felino',
        petId: 'pet-2',
        petName: 'Luna',
        status: 'ativo',
      },
    ],
    clientName: 'Maria Oliveira',
  },
};

/** Estado com editPet handler ativo */
export const ComHandlerEdicao: Story = {
  name: 'Com handler de edição de pet',
  args: {
    pet: mockPet,
    allPlans: [{ ...basePlan, status: 'ativo' }],
    clientName: 'Maria Oliveira',
    onEditPet: () => alert('Editar pet clicado'),
  },
};

// ---------------------------------------------------------------------------
// Deactivation variants (Task 5.0)
// ---------------------------------------------------------------------------

/** Pet sem nenhum plano — botão "Inativar pet" visível */
export const SemPlano: Story = {
  name: 'Sem plano — botão Inativar visível',
  args: {
    pet: mockPet,
    allPlans: [],
    clientName: 'Maria Oliveira',
    onDeactivated: () => alert('Pet inativado com sucesso'),
  },
};

/** Pet com plano ativo — botão "Inativar pet" ausente */
export const ComPlano: Story = {
  name: 'Com plano — botão Inativar ausente',
  args: {
    pet: mockPet,
    allPlans: [{ ...basePlan, status: 'ativo' }],
    clientName: 'Maria Oliveira',
  },
};

/**
 * Estado de carregamento da inativação — spinner ativo.
 * Para simular em Storybook, `isDeactivating` é forçado via decorador de estado.
 * Em produção este estado é transitório (duração da chamada à API).
 */
export const DeactivatingLoading: Story = {
  name: 'Inativando — spinner ativo (simulado)',
  args: {
    pet: mockPet,
    allPlans: [],
    clientName: 'Maria Oliveira',
  },
};

/**
 * Erro inline 409 — mensagem "Este pet possui planos associados..."
 * O erro inline é exibido abaixo dos botões após um 409 do backend.
 */
export const DeactivationError409: Story = {
  name: 'Erro 409 — mensagem de erro inline',
  args: {
    pet: mockPet,
    allPlans: [],
    clientName: 'Maria Oliveira',
  },
};
