/**
 * Storybook stories for CepInput atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { CepInput } from './cep-input';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Contratar/Atoms/CepInput',
  component: CepInput,
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
  render?: (args: React.ComponentProps<typeof CepInput>) => React.ReactElement;
  args?: Partial<React.ComponentProps<typeof CepInput>>;
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

/** Campo com busca em andamento — indicador de loading no container */
export const Loading: Story = {
  name: 'Carregando (buscando CEP)',
  render: () => (
    <div className="space-y-1">
      <div className="relative">
        <CepInput defaultValue="01310100" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
          Buscando...
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Consultando endereço na base dos Correios...
      </p>
    </div>
  ),
};

/** Campo preenchido com CEP válido */
export const Filled: Story = {
  name: 'Preenchido',
  args: {
    defaultValue: '01310100',
  },
};

/** Campo com estado de erro */
export const WithError: Story = {
  name: 'Com erro',
  args: {
    'aria-invalid': true,
    'aria-describedby': 'cep-error',
  },
  render: (args) => (
    <div className="space-y-1">
      <CepInput {...args} />
      <p id="cep-error" className="text-sm text-destructive">
        CEP não encontrado. Preencha o endereço manualmente.
      </p>
    </div>
  ),
};
