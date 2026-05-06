import type React from 'react';
import { CardExpiryInput } from './card-expiry-input';
import type { CardExpiryInputProps } from './card-expiry-input';

const meta = {
  title: 'public/contratar/atoms/CardExpiryInput',
  component: CardExpiryInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: CardExpiryInputProps) => React.ReactElement;
  args?: Partial<CardExpiryInputProps>;
  name?: string;
};

const baseArgs: CardExpiryInputProps = {
  value: '',
  onChange: () => {},
};

export const Default: Story = { name: 'Default', args: { ...baseArgs } };

export const Filled: Story = { name: 'Preenchido', args: { ...baseArgs, value: '1230' } };

export const WithError: Story = {
  name: 'Com erro',
  args: { ...baseArgs, value: '1330', error: 'Mês inválido (01–12).' },
};

export const Disabled: Story = {
  name: 'Desabilitado',
  args: { ...baseArgs, value: '1230', disabled: true },
};
