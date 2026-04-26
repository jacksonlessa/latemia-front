import type React from 'react';
import { CardForm, EMPTY_CARD_FORM_VALUE } from './card-form';
import type { CardFormProps } from './card-form';

const meta = {
  title: 'public/contratar/organisms/CardForm',
  component: CardForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: CardFormProps) => React.ReactElement;
  args?: Partial<CardFormProps>;
  name?: string;
};

const baseArgs: CardFormProps = {
  value: EMPTY_CARD_FORM_VALUE,
  onChange: () => {},
};

export const Default: Story = {
  name: 'Default — vazio',
  args: { ...baseArgs },
};

export const FilledValid: Story = {
  name: 'Preenchido válido',
  args: {
    ...baseArgs,
    value: {
      number: '4000000000000010',
      holderName: 'JOAO SILVA',
      expiry: '1230',
      cvv: '123',
    },
  },
};

export const InlineErrors: Story = {
  name: 'Erro inline',
  args: {
    ...baseArgs,
    value: {
      number: '1111',
      holderName: '',
      expiry: '1330',
      cvv: '1',
    },
    errors: {
      number: 'Número de cartão inválido.',
      holderName: 'Informe o nome impresso no cartão.',
      expiry: 'Mês inválido (01–12).',
      cvv: 'CVV deve ter 3 ou 4 dígitos.',
    },
  },
};

export const PostChargeError: Story = {
  name: 'Erro pós-cobrança (CVV limpo)',
  args: {
    ...baseArgs,
    value: {
      number: '4000000000000010',
      holderName: 'JOAO SILVA',
      expiry: '1230',
      cvv: '',
    },
    errors: {
      cvv: 'Cartão recusado. Confira o CVV e tente novamente.',
    },
    clearCvvOnError: true,
  },
};
