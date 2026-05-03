/**
 * Storybook stories for PetListSticky organism.
 */

import type React from 'react';
import { PetListSticky } from './pet-list-sticky';
import type { PetListItemData } from '../molecules/pet-list-item';

const meta = {
  title: 'Admin - Clientes/Organisms/PetListSticky',
  component: PetListSticky,
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

const mockPets: PetListItemData[] = [
  {
    id: 'pet-1',
    name: 'Rex',
    species: 'canino',
    breed: 'Labrador',
    birthDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    planStatus: 'ativo',
  },
  {
    id: 'pet-2',
    name: 'Luna',
    species: 'felino',
    breed: 'Siamês',
    birthDate: new Date(Date.now() - 10 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    planStatus: 'carencia',
  },
  {
    id: 'pet-3',
    name: 'Bolinha',
    species: 'canino',
    breed: 'Poodle',
    birthDate: new Date(Date.now() - 14 * 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/** Lista com múltiplos pets, primeiro selecionado */
export const Default: Story = {
  name: 'Default',
  args: {
    pets: mockPets,
    selectedPetId: 'pet-1',
  },
};

/** Segundo pet selecionado */
export const SegundoSelecionado: Story = {
  name: 'Segundo pet selecionado',
  args: {
    pets: mockPets,
    selectedPetId: 'pet-2',
  },
};

/** Lista vazia */
export const Empty: Story = {
  name: 'Vazio (sem pets)',
  args: {
    pets: [],
  },
};

/** Um único pet */
export const UmPet: Story = {
  name: 'Um único pet',
  args: {
    pets: [mockPets[0]],
    selectedPetId: 'pet-1',
  },
};

/** Múltiplos pets com status variados */
export const StatusVariados: Story = {
  name: 'Múltiplos status',
  args: {
    pets: [
      { ...mockPets[0], planStatus: 'inadimplente' },
      { ...mockPets[1], planStatus: 'pendente' },
      { ...mockPets[2], planStatus: 'cancelado' },
    ],
    selectedPetId: 'pet-1',
  },
};
