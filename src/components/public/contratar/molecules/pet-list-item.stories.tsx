/**
 * Storybook stories for PetListItem molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PetListItem, type PetListItemProps } from './pet-list-item';

const meta = {
  title: 'public/contratar/molecules/PetListItem',
  component: PetListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = {
  render?: (args: PetListItemProps) => React.ReactElement;
  args?: Partial<PetListItemProps>;
  name?: string;
};

function dateYearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

function dateMonthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

const dogPet: PetListItemProps['pet'] = {
  _id: 'pet-dog',
  name: 'Late',
  species: 'canino',
  breed: 'Golden Retriever',
  birthDate: dateYearsAgo(3),
  sex: 'male',
  weight: 28.5,
  castrated: false,
};

const catPet: PetListItemProps['pet'] = {
  _id: 'pet-cat',
  name: 'Mia',
  species: 'felino',
  breed: 'SRD',
  birthDate: dateMonthsAgo(8),
  sex: 'female',
  weight: 4.2,
  castrated: false,
};

const noop = () => {};

/** Pet cachorro com dados básicos. */
export const Dog: Story = {
  name: 'Cachorro',
  args: { pet: dogPet, onEdit: noop, onRemove: noop, canRemove: true },
};

/** Pet gato com idade em meses. */
export const Cat: Story = {
  name: 'Gato',
  args: { pet: catPet, onEdit: noop, onRemove: noop, canRemove: true },
};

/** Pet castrado — exibe o sufixo "· castrado(a)". */
export const Castrated: Story = {
  name: 'Castrado(a)',
  args: {
    pet: { ...dogPet, sex: 'female', castrated: true, name: 'Mel' },
    onEdit: noop,
    onRemove: noop,
    canRemove: true,
  },
};

/** Único pet — botão de remover desabilitado. */
export const RemoveDisabled: Story = {
  name: 'Remover desabilitado',
  args: { pet: dogPet, onEdit: noop, onRemove: noop, canRemove: false },
};
