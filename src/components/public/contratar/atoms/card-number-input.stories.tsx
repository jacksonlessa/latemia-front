/**
 * Storybook stories for CardNumberInput atom.
 */
import type React from 'react';
import { CardNumberInput } from './card-number-input';
import type { CardNumberInputProps } from './card-number-input';

const meta = {
  title: 'public/contratar/atoms/CardNumberInput',
  component: CardNumberInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: CardNumberInputProps) => React.ReactElement;
  args?: Partial<CardNumberInputProps>;
  name?: string;
};

const baseArgs: CardNumberInputProps = {
  value: '',
  onChange: () => {},
};

export const Default: Story = {
  name: 'Default',
  args: { ...baseArgs },
};

export const Filled: Story = {
  name: 'Preenchido',
  args: { ...baseArgs, value: '4000000000000010' },
};

export const WithError: Story = {
  name: 'Com erro',
  args: { ...baseArgs, value: '1111', error: 'Número de cartão inválido.' },
};

export const Disabled: Story = {
  name: 'Desabilitado',
  args: { ...baseArgs, value: '4000000000000010', disabled: true },
};
