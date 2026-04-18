/**
 * Storybook stories for CpfInput atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { CpfInput } from './cpf-input';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Contratar/Atoms/CpfInput',
  component: CpfInput,
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
  render?: (args: React.ComponentProps<typeof CpfInput>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof CpfInput>>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Campo vazio — estado inicial sem valor */
export const Default: Story = {
  name: 'Padrão (vazio)',
  args: {},
};

/** Campo com valor preenchido */
export const WithValue: Story = {
  name: 'Com valor',
  args: {
    defaultValue: '12345678901',
  },
};

/** Campo com estado de erro */
export const WithError: Story = {
  name: 'Com erro',
  args: {
    'aria-invalid': true,
    'aria-describedby': 'cpf-error',
  },
  render: (args) => (
    <div className="space-y-1">
      <CpfInput {...args} />
      <p id="cpf-error" className="text-sm text-destructive">
        CPF inválido. Verifique o número digitado.
      </p>
    </div>
  ),
};

/** Campo desabilitado */
export const Disabled: Story = {
  name: 'Desabilitado',
  args: {
    defaultValue: '11111111111',
    disabled: true,
  },
};
