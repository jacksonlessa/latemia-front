/**
 * Storybook stories for PetListItem molecule.
 */

import type React from 'react';
import { PetListItem, type PetListItemData } from './pet-list-item';

const meta = {
  title: 'Admin - Clientes/Molecules/PetListItem',
  component: PetListItem,
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

const mockPetCanino: PetListItemData = {
  id: 'pet-1',
  name: 'Rex',
  species: 'canino',
  breed: 'Labrador',
  birthDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  planStatus: 'ativo',
};

const mockPetFelino: PetListItemData = {
  id: 'pet-2',
  name: 'Luna',
  species: 'felino',
  breed: 'Siamês',
  birthDate: new Date(Date.now() - 10 * 30 * 24 * 60 * 60 * 1000).toISOString(),
  planStatus: 'carencia',
};

const mockPetSemPlano: PetListItemData = {
  id: 'pet-3',
  name: 'Bolinha',
  species: 'canino',
  breed: 'Poodle',
  birthDate: new Date(Date.now() - 14 * 30 * 24 * 60 * 60 * 1000).toISOString(),
};

/** Pet com plano ativo — estado padrão */
export const Default: Story = {
  name: 'Default (ativo)',
  args: {
    pet: mockPetCanino,
    selected: false,
  },
};

/** Pet selecionado */
export const Selected: Story = {
  name: 'Selecionado',
  args: {
    pet: mockPetCanino,
    selected: true,
  },
};

/** Pet felino com status carência */
export const Carencia: Story = {
  name: 'Carência (felino)',
  args: {
    pet: mockPetFelino,
    selected: false,
  },
};

/** Pet sem plano */
export const SemPlano: Story = {
  name: 'Sem plano',
  args: {
    pet: mockPetSemPlano,
    selected: false,
  },
};

/** Pet com plano inadimplente */
export const Inadimplente: Story = {
  name: 'Inadimplente',
  args: {
    pet: {
      ...mockPetCanino,
      id: 'pet-4',
      name: 'Max',
      planStatus: 'inadimplente',
    },
    selected: false,
  },
};

/** Pet com plano pendente */
export const Pendente: Story = {
  name: 'Pendente',
  args: {
    pet: {
      ...mockPetCanino,
      id: 'pet-5',
      name: 'Buddy',
      planStatus: 'pendente',
    },
    selected: false,
  },
};

/** Pet com plano cancelado (terminal) */
export const Cancelado: Story = {
  name: 'Cancelado (terminal)',
  args: {
    pet: {
      ...mockPetCanino,
      id: 'pet-6',
      name: 'Thor',
      planStatus: 'cancelado',
    },
    selected: false,
  },
};
