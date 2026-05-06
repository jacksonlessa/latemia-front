/**
 * Storybook stories for ClientPetsList organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { ClientPetsList } from './client-pets-list';
import type { PetListItem } from '@/lib/types/client';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Clientes/Organisms/ClientPetsList',
  component: ClientPetsList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

interface ClientPetsListProps {
  pets: PetListItem[];
  clientId: string;
}

type Story = {
  render?: (args: ClientPetsListProps) => React.ReactElement;
  args?: Partial<ClientPetsListProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Mock data — no real personal data
// ---------------------------------------------------------------------------

const mockPets: PetListItem[] = [
  {
    id: 'uuid-pet-1',
    name: 'Rex',
    species: 'canino',
    breed: 'Labrador',
    birthDate: '2022-03-01T00:00:00.000Z',
    sex: 'male',
    weight: 28.5,
    castrated: true,
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'uuid-pet-2',
    name: 'Mia',
    species: 'felino',
    breed: 'SRD',
    birthDate: '2023-07-15T00:00:00.000Z',
    sex: 'female',
    weight: 4.2,
    castrated: false,
    createdAt: '2026-01-15T10:05:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Lista com pets cadastrados — estado padrão */
export const Default: Story = {
  name: 'Padrão (com pets)',
  args: {
    pets: mockPets,
    clientId: 'uuid-client-1',
  },
};

/** Lista vazia — cliente sem pets cadastrados */
export const Empty: Story = {
  name: 'Vazio (sem pets)',
  args: {
    pets: [],
    clientId: 'uuid-client-1',
  },
};
