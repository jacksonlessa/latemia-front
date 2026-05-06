/**
 * Storybook stories for PaymentMethodToggle atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { useState } from 'react';
import { PaymentMethodToggle } from './PaymentMethodToggle';
import type { PaymentMethod } from '@/lib/billing/types';

const meta = {
  title: 'Admin - Planos de Assinatura/Atoms/PaymentMethodToggle',
  component: PaymentMethodToggle,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  args?: Record<string, unknown>;
  name?: string;
};

/** Padrão — cartão de crédito pré-selecionado */
export const Default: Story = {
  name: 'Default',
  render: () => {
    const [selected, setSelected] = useState<PaymentMethod[]>(['credit_card']);
    return <PaymentMethodToggle value={selected} onChange={setSelected} />;
  },
};

/** Todos selecionados */
export const AllSelected: Story = {
  name: 'Todos Selecionados',
  render: () => {
    const [selected, setSelected] = useState<PaymentMethod[]>(['credit_card', 'boleto']);
    return <PaymentMethodToggle value={selected} onChange={setSelected} />;
  },
};

/** Nenhum selecionado */
export const NoneSelected: Story = {
  name: 'Nenhum Selecionado',
  render: () => {
    const [selected, setSelected] = useState<PaymentMethod[]>([]);
    return <PaymentMethodToggle value={selected} onChange={setSelected} />;
  },
};

/** Desabilitado */
export const Disabled: Story = {
  name: 'Desabilitado',
  render: () => (
    <PaymentMethodToggle value={['credit_card']} onChange={() => undefined} disabled />
  ),
};
