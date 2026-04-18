/**
 * Storybook stories for PetCard molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PetCard } from './pet-card';
import type { PetCardProps } from './pet-card';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/contratar/molecules/PetCard',
  component: PetCard,
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
  render?: (args: PetCardProps) => React.ReactElement;
  args?: Partial<PetCardProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Shared base args
// ---------------------------------------------------------------------------

const baseArgs: PetCardProps = {
  index: 0,
  data: {},
  errors: {},
  onChange: () => {},
  onRemove: () => {},
  canRemove: true,
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Card vazio — estado inicial antes de qualquer preenchimento */
export const Empty: Story = {
  name: 'Vazio',
  args: {
    ...baseArgs,
    data: {},
  },
};

/** Card preenchido com dados válidos */
export const Filled: Story = {
  name: 'Preenchido',
  args: {
    ...baseArgs,
    data: {
      species: 'canino',
      name: 'Rex',
      breed: 'Labrador',
      age_years: 3,
      age_months: 0,
      weight: 28.5,
      castrated: true,
    },
  },
};

/** Card com erros de validação em todos os campos */
export const WithErrors: Story = {
  name: 'Com erros',
  args: {
    ...baseArgs,
    data: {
      name: '',
      breed: '',
    },
    errors: {
      species: 'Selecione a espécie do pet.',
      name: 'O nome é obrigatório.',
      breed: 'A raça é obrigatória.',
      age_years: 'A idade deve ser maior ou igual a 0.',
      weight: 'O peso deve ser maior que 0.',
    },
  },
};

/** Card único — botão de remoção desabilitado */
export const SinglePet: Story = {
  name: 'Único (remoção desabilitada)',
  args: {
    ...baseArgs,
    canRemove: false,
    data: {
      species: 'felino',
      name: 'Mia',
      breed: 'SRD',
      age_years: 1,
      age_months: 0,
      weight: 4.0,
      castrated: false,
    },
  },
};
