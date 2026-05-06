/**
 * Storybook stories for SexToggle atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { SexToggle, type SexToggleProps } from './sex-toggle';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Contratar/Atoms/SexToggle',
  component: SexToggle,
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
  render?: (args: SexToggleProps) => React.ReactElement;
  args?: Partial<SexToggleProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Nenhuma opção selecionada (estado inicial) */
export const Default: Story = {
  name: 'Padrão (sem seleção)',
  args: {
    value: undefined,
    onChange: () => {},
  },
};

/** Macho selecionado */
export const SelectedMale: Story = {
  name: 'Macho selecionado',
  args: {
    value: 'male',
    onChange: () => {},
  },
};

/** Fêmea selecionada */
export const SelectedFemale: Story = {
  name: 'Fêmea selecionada',
  args: {
    value: 'female',
    onChange: () => {},
  },
};

/** Estado de erro (sem seleção) */
export const Error: Story = {
  name: 'Erro de validação',
  args: {
    id: 'sex-toggle-error',
    value: undefined,
    onChange: () => {},
    error: 'Selecione o sexo do pet',
  },
};
