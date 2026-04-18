/**
 * Storybook stories for StepPets organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { StepPets } from './step-pets';
import type { StepPetsProps } from './step-pets';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/contratar/organisms/StepPets',
  component: StepPets,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: (args: StepPetsProps) => React.ReactElement;
  args?: Partial<StepPetsProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Shared handlers
// ---------------------------------------------------------------------------

const noop = () => {};

const baseArgs: StepPetsProps = {
  pets: [],
  errors: {},
  onPetChange: noop,
  onAddPet: noop,
  onRemovePet: noop,
  onNext: noop,
  onBack: noop,
  pricePerPetCents: 2500,
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Um único pet — botão de remoção desabilitado */
export const OnePet: Story = {
  name: '1 pet',
  args: {
    ...baseArgs,
    pets: [
      {
        _id: 'pet-1',
        species: 'canino',
        name: 'Rex',
        breed: 'Labrador',
        age_years: 3,
        age_months: 0,
        weight: 28.5,
        castrated: true,
      },
    ],
  },
};

/** Três pets — botão de remoção ativo em todos os cards; subtotal correto */
export const ThreePets: Story = {
  name: '3 pets',
  args: {
    ...baseArgs,
    pets: [
      {
        _id: 'pet-1',
        species: 'canino',
        name: 'Rex',
        breed: 'Labrador',
        age_years: 3,
        age_months: 0,
        weight: 28.5,
        castrated: true,
      },
      {
        _id: 'pet-2',
        species: 'felino',
        name: 'Mia',
        breed: 'SRD',
        age_years: 1,
        age_months: 0,
        weight: 4.0,
        castrated: false,
      },
      {
        _id: 'pet-3',
        species: 'canino',
        name: 'Bolt',
        breed: 'Poodle',
        age_years: 5,
        age_months: 0,
        weight: 6.0,
        castrated: true,
      },
    ],
  },
};

/** Passo com erros de validação visíveis nos cards */
export const WithErrors: Story = {
  name: 'Com erros',
  args: {
    ...baseArgs,
    pets: [
      {
        _id: 'pet-1',
        species: undefined,
        name: '',
        breed: '',
        age_years: undefined,
        age_months: 0,
        weight: undefined,
        castrated: undefined,
      },
    ],
    errors: {
      'pets[0].species': 'Selecione a espécie do pet.',
      'pets[0].name': 'O nome é obrigatório.',
      'pets[0].breed': 'A raça é obrigatória.',
      'pets[0].weight': 'O peso deve ser maior que 0.',
    },
  },
};
