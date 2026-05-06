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

/** Formulário preenchido com complemento — endereço de cidade atendida */
export const ComComplemento: Story = {
  name: 'Preenchido com complemento',
  args: {
    ...baseArgs,
    data: {
      name: 'Maria da Silva',
      cpf: '529.982.247-25',
      email: 'maria@exemplo.com.br',
      phone: '(47) 99999-8888',
      address: {
        cep: '88340-000',
        street: 'Rua das Palmeiras',
        number: '42',
        complement: 'Apto 205, Bloco B',
        neighborhood: 'Centro',
        city: 'Camboriú',
        state: 'SC',
      },
    },
  },
};

/** Erro de cidade não atendida — CEP retornou cidade fora da área de atendimento */
export const ErroCidadeNaoAtendida: Story = {
  name: 'Erro: cidade não atendida',
  args: {
    ...baseArgs,
    data: {
      name: 'João Pereira',
      cpf: '529.982.247-25',
      email: 'joao@exemplo.com.br',
      phone: '(48) 98765-4321',
      address: {
        cep: '88010-000',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    },
    errors: {
      'address.cep':
        'No momento atendemos apenas Camboriú, Balneário Camboriú, Itapema e Itajaí.',
    },
  },
};

/** Erro de CEP não encontrado — lookup ViaCEP retornou null */
export const ErroCepNaoEncontrado: Story = {
  name: 'Erro: CEP não encontrado',
  args: {
    ...baseArgs,
    data: {
      name: 'Ana Costa',
      cpf: '529.982.247-25',
      email: 'ana@exemplo.com.br',
      phone: '(47) 97777-5555',
      address: {
        cep: '00000-000',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    },
    errors: {
      'address.cep': 'CEP não encontrado. Verifique e tente novamente.',
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
