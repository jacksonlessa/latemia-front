/**
 * Storybook stories for PhoneInput atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PhoneInput } from './phone-input';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Contratar/Atoms/PhoneInput',
  component: PhoneInput,
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
  render?: (args: React.ComponentProps<typeof PhoneInput>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof PhoneInput>>;
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
    defaultValue: '11987654321',
  },
};

/** Campo com estado de erro */
export const WithError: Story = {
  name: 'Com erro',
  args: {
    'aria-invalid': true,
    'aria-describedby': 'phone-error',
  },
  render: (args) => (
    <div className="space-y-1">
      <PhoneInput {...args} />
      <p id="phone-error" className="text-sm text-destructive">
        Telefone inválido. Informe um número com DDD.
      </p>
    </div>
  ),
};

/** Campo desabilitado */
export const Disabled: Story = {
  name: 'Desabilitado',
  args: {
    defaultValue: '11912344321',
    disabled: true,
  },
};
