import type React from 'react';
import { CardCvvInput } from './card-cvv-input';
import type { CardCvvInputProps } from './card-cvv-input';

const meta = {
  title: 'public/contratar/atoms/CardCvvInput',
  component: CardCvvInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: CardCvvInputProps) => React.ReactElement;
  args?: Partial<CardCvvInputProps>;
  name?: string;
};

const baseArgs: CardCvvInputProps = {
  value: '',
  onChange: () => {},
};

export const Default: Story = { name: 'Default', args: { ...baseArgs } };

export const Filled: Story = { name: 'Preenchido', args: { ...baseArgs, value: '123' } };

export const WithError: Story = {
  name: 'Com erro',
  args: { ...baseArgs, value: '1', error: 'CVV deve ter 3 ou 4 dígitos.' },
};

export const Disabled: Story = {
  name: 'Desabilitado',
  args: { ...baseArgs, value: '123', disabled: true },
};
