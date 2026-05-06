import type React from 'react';
import { CardHolderInput } from './card-holder-input';
import type { CardHolderInputProps } from './card-holder-input';

const meta = {
  title: 'public/contratar/atoms/CardHolderInput',
  component: CardHolderInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: CardHolderInputProps) => React.ReactElement;
  args?: Partial<CardHolderInputProps>;
  name?: string;
};

const baseArgs: CardHolderInputProps = {
  value: '',
  onChange: () => {},
};

export const Default: Story = { name: 'Default', args: { ...baseArgs } };

export const Filled: Story = { name: 'Preenchido', args: { ...baseArgs, value: 'JOAO SILVA' } };

export const WithError: Story = {
  name: 'Com erro',
  args: { ...baseArgs, value: '', error: 'Informe o nome impresso no cartão.' },
};

export const Disabled: Story = {
  name: 'Desabilitado',
  args: { ...baseArgs, value: 'JOAO SILVA', disabled: true },
};
