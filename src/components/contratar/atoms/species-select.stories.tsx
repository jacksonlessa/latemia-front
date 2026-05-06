/**
 * Storybook stories for SpeciesSelect atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { SpeciesSelect } from './species-select';
import type { PetSpecies } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Contratar/Atoms/SpeciesSelect',
  component: SpeciesSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

interface SpeciesSelectProps {
  id?: string;
  name?: string;
  value: PetSpecies | '';
  onChange: (value: PetSpecies | '') => void;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

type Story = {
  render?: (args: SpeciesSelectProps) => React.ReactElement;
  args?: Partial<SpeciesSelectProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Sem seleção — estado inicial */
export const Default: Story = {
  name: 'Padrão (sem seleção)',
  args: {
    value: '',
    onChange: () => {},
  },
};

/** Espécie canino selecionada */
export const CaninoSelected: Story = {
  name: 'Canino selecionado',
  args: {
    value: 'canino',
    onChange: () => {},
  },
};

/** Espécie felino selecionada */
export const FelinoSelected: Story = {
  name: 'Felino selecionado',
  args: {
    value: 'felino',
    onChange: () => {},
  },
};
