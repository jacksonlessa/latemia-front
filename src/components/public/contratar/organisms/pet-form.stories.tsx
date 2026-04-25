/**
 * Storybook stories for PetForm organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PetForm, type PetFormProps } from './pet-form';

const meta = {
  title: 'public/contratar/organisms/PetForm',
  component: PetForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = {
  render?: (args: PetFormProps) => React.ReactElement;
  args?: Partial<PetFormProps>;
  name?: string;
};

function dateYearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

const baseArgs: PetFormProps = {
  onSave: () => {},
  onCancel: () => {},
};

/** Form em modo "novo pet". */
export const New: Story = {
  name: 'Novo pet',
  args: { ...baseArgs },
};

/** Form em modo edição com dados pré-preenchidos. */
export const Edit: Story = {
  name: 'Editar pet',
  args: {
    ...baseArgs,
    initial: {
      name: 'Late',
      species: 'canino',
      breed: 'Golden Retriever',
      birthDate: dateYearsAgo(3),
      sex: 'male',
      weight: 28.5,
      castrated: true,
    },
  },
};

/**
 * Form com erros de validação após tentativa de salvar com campos vazios.
 * Para visualizar os erros: clique em "Adicionar pet" sem preencher.
 */
export const ValidationError: Story = {
  name: 'Erro de validação',
  args: { ...baseArgs },
};
