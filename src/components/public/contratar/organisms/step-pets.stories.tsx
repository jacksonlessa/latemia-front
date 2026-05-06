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
import type { RegisterPetInput } from '@/lib/types/pet';

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
// Sample data
// ---------------------------------------------------------------------------

const noop = () => {};

function yearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

const rex: RegisterPetInput & { _id: string } = {
  _id: 'pet-1',
  name: 'Rex',
  species: 'canino',
  breed: 'Labrador',
  birthDate: yearsAgo(3),
  sex: 'male',
  weight: 28.5,
  castrated: true,
};

const mia: RegisterPetInput & { _id: string } = {
  _id: 'pet-2',
  name: 'Mia',
  species: 'felino',
  breed: 'SRD',
  birthDate: yearsAgo(1),
  sex: 'female',
  weight: 4,
  castrated: false,
};

const bolt: RegisterPetInput & { _id: string } = {
  _id: 'pet-3',
  name: 'Bolt',
  species: 'canino',
  breed: 'Poodle',
  birthDate: yearsAgo(5),
  sex: 'male',
  weight: 6,
  castrated: true,
};

const baseArgs: StepPetsProps = {
  pets: [],
  onSavePet: noop,
  onRemovePet: noop,
  onNext: noop,
  onBack: noop,
  pricePerPetCents: 2500,
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Lista vazia — entra direto no Estado A (PetForm) */
export const Empty: Story = {
  name: 'Vazio (Estado A inicial)',
  args: {
    ...baseArgs,
    pets: [],
  },
};

/** Um pet — Estado B com botão de remover desabilitado */
export const OnePet: Story = {
  name: '1 pet',
  args: {
    ...baseArgs,
    pets: [rex],
  },
};

/** Múltiplos pets — Estado B com remoção habilitada e total atualizado */
export const MultiPets: Story = {
  name: 'Vários pets',
  args: {
    ...baseArgs,
    pets: [rex, mia, bolt],
  },
};

/** Edição forçada de um pet existente — exercita Estado A com `initial` */
export const Editing: Story = {
  name: 'Editando pet existente',
  args: {
    ...baseArgs,
    pets: [rex, mia],
    initialEditing: 'pet-1',
  },
};
