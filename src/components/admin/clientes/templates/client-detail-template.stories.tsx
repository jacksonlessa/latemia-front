/**
 * Storybook stories for ClientDetailTemplate.
 *
 * `ClientDetailTemplate` is a thin Server Component that adds a "Voltar para
 * Clientes" breadcrumb and delegates everything else to `ClientDetailPageClient`
 * (the interactive Client Component). Because Storybook runs in a browser
 * environment and cannot execute React Server Components, these stories render
 * `ClientDetailPageClient` directly — which is the only stateful layer.
 *
 * Variants covered:
 * - Cliente com múltiplos pets e planos variados (default)
 * - Cliente com um único pet sem plano
 * - Cliente sem nenhum pet (empty state)
 * - Cliente com plano inadimplente selecionado inicialmente
 */

import type React from 'react';
import { ClientDetailPageClient } from '../organisms/client-detail-page-client';
import type { ClientDetail } from '@/lib/types/client';
import type { PlanListItem } from '@/lib/types/plan';

const meta = {
  title: 'Admin - Clientes/Templates/ClientDetailTemplate',
  component: ClientDetailPageClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // Provides a plausible admin shell background
    backgrounds: {
      default: 'admin',
      values: [{ name: 'admin', value: '#F4F9F7' }],
    },
  },
};

export default meta;

type Story = {
  render?: (args: unknown) => React.ReactElement;
  args?: Record<string, unknown>;
  name?: string;
  decorators?: Array<(Story: React.ComponentType) => React.ReactElement>;
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockClient: ClientDetail = {
  id: 'client-1',
  name: 'Maria Oliveira Santos',
  cpf: '12345678901',
  phone: '47987654321',
  email: 'maria.oliveira@email.com',
  addresses: [
    {
      id: 'addr-1',
      cep: '88010000',
      street: 'Rua Felipe Schmidt',
      number: '100',
      complement: 'Apto 302',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  pets: [
    {
      id: 'pet-1',
      name: 'Rex',
      species: 'canino',
      breed: 'Labrador',
      birthDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      sex: 'male',
      weight: 25,
      castrated: false,
      createdAt: '2022-01-10T10:00:00.000Z',
    },
    {
      id: 'pet-2',
      name: 'Luna',
      species: 'felino',
      breed: 'Siamês',
      birthDate: new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      sex: 'female',
      weight: 4,
      castrated: true,
      createdAt: '2022-06-15T10:00:00.000Z',
    },
    {
      id: 'pet-3',
      name: 'Bolinha',
      species: 'canino',
      breed: 'Poodle',
      birthDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      sex: 'male',
      weight: 8,
      castrated: false,
      createdAt: '2023-03-20T10:00:00.000Z',
    },
  ],
  createdAt: '2022-01-10T10:00:00.000Z',
};

const mockPlans: PlanListItem[] = [
  {
    id: 'plan-1',
    status: 'ativo',
    clientId: 'client-1',
    clientName: 'Maria Oliveira Santos',
    petId: 'pet-1',
    petName: 'Rex',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'plan-2',
    status: 'carencia',
    clientId: 'client-1',
    clientName: 'Maria Oliveira Santos',
    petId: 'pet-2',
    petName: 'Luna',
    createdAt: '2024-11-01T10:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Estado padrão — múltiplos pets, planos variados */
export const Default: Story = {
  name: 'Default (múltiplos pets)',
  args: {
    client: mockClient,
    plans: mockPlans,
  },
};

/** Cliente com um único pet sem plano vigente */
export const UmPetSemPlano: Story = {
  name: 'Um pet sem plano',
  args: {
    client: {
      ...mockClient,
      pets: [mockClient.pets[0]],
    },
    plans: [],
  },
};

/** Cliente sem nenhum pet cadastrado */
export const SemPets: Story = {
  name: 'Sem pets (empty state)',
  args: {
    client: {
      ...mockClient,
      pets: [],
    },
    plans: [],
  },
};

/** Cliente com plano inadimplente — selecionado inicialmente */
export const PlanoInadimplente: Story = {
  name: 'Plano inadimplente',
  args: {
    client: {
      ...mockClient,
      pets: [mockClient.pets[0]],
    },
    plans: [
      {
        id: 'plan-inadimplente',
        status: 'inadimplente',
        clientId: 'client-1',
        clientName: 'Maria Oliveira Santos',
        petId: 'pet-1',
        petName: 'Rex',
        createdAt: '2023-10-01T10:00:00.000Z',
      },
    ],
  },
};

/** Cliente com histórico de planos inativos */
export const ComHistoricoInativos: Story = {
  name: 'Com histórico de planos inativos',
  args: {
    client: {
      ...mockClient,
      pets: [mockClient.pets[0]],
    },
    plans: [
      {
        id: 'plan-ativo',
        status: 'ativo',
        clientId: 'client-1',
        clientName: 'Maria Oliveira Santos',
        petId: 'pet-1',
        petName: 'Rex',
        createdAt: '2024-01-15T10:00:00.000Z',
      },
      {
        id: 'plan-cancelado',
        status: 'cancelado',
        clientId: 'client-1',
        clientName: 'Maria Oliveira Santos',
        petId: 'pet-1',
        petName: 'Rex',
        createdAt: '2023-01-01T10:00:00.000Z',
      },
      {
        id: 'plan-estornado',
        status: 'estornado',
        clientId: 'client-1',
        clientName: 'Maria Oliveira Santos',
        petId: 'pet-1',
        petName: 'Rex',
        createdAt: '2022-06-01T10:00:00.000Z',
      },
    ],
  },
};
