/**
 * Storybook stories for StepCadastro organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { StepCadastro } from './step-cadastro';
import type { StepCadastroProps } from './step-cadastro';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/contratar/organisms/StepCadastro',
  component: StepCadastro,
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
  render?: (args: StepCadastroProps) => React.ReactElement;
  args?: Partial<StepCadastroProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Shared handlers
// ---------------------------------------------------------------------------

const noop = () => {};

const baseArgs: StepCadastroProps = {
  data: {},
  errors: {},
  onChange: noop,
  onAddressLookup: noop,
  onNext: noop,
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Formulário vazio — estado inicial sem dados preenchidos */
export const Default: Story = {
  name: 'Vazio (padrão)',
  args: {
    ...baseArgs,
  },
};

/** Formulário preenchido — todos os campos com dados válidos */
export const Preenchido: Story = {
  name: 'Preenchido',
  args: {
    ...baseArgs,
    data: {
      name: 'Maria da Silva',
      cpf: '529.982.247-25',
      email: 'maria@exemplo.com.br',
      phone: '(11) 99999-8888',
      address: {
        cep: '01310-100',
        street: 'Avenida Paulista',
        number: '1578',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      },
    },
  },
};

/** Formulário com erros inline — todos os campos exibindo mensagens de erro */
export const ComErros: Story = {
  name: 'Com erros',
  args: {
    ...baseArgs,
    data: {
      name: '',
      cpf: '111.111.111-11',
      email: 'email-invalido',
      phone: '',
      address: {
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    },
    errors: {
      name: 'O nome é obrigatório.',
      cpf: 'CPF inválido.',
      email: 'Informe um e-mail válido.',
      phone: 'O telefone é obrigatório.',
      'address.cep': 'CEP é obrigatório.',
      'address.street': 'A rua é obrigatória.',
      'address.number': 'O número é obrigatório.',
      'address.neighborhood': 'O bairro é obrigatório.',
      'address.city': 'A cidade é obrigatória.',
      'address.state': 'O estado é obrigatório.',
    },
  },
};
