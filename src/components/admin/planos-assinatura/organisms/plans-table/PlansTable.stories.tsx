/**
 * Storybook stories for PlansTable organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { PlansTable } from './PlansTable';
import type { Plan } from '@/lib/billing/types';

const meta = {
  title: 'Admin - Planos de Assinatura/Organisms/PlansTable',
  component: PlansTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

const samplePlans: Plan[] = [
  {
    id: 'plan_001',
    name: 'Plano Mensal Básico',
    status: 'active',
    interval: 'month',
    intervalCount: 1,
    billingType: 'prepaid',
    currency: 'BRL',
    paymentMethods: ['credit_card'],
    installments: [1],
    items: [{ name: 'Assinatura', quantity: 1, pricingScheme: 'unit' }],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'plan_002',
    name: 'Plano Anual Premium',
    status: 'active',
    interval: 'year',
    intervalCount: 1,
    billingType: 'prepaid',
    currency: 'BRL',
    paymentMethods: ['credit_card', 'boleto'],
    installments: [1, 6, 12],
    items: [{ name: 'Assinatura anual', quantity: 1, pricingScheme: 'unit' }],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'plan_003',
    name: 'Plano Trimestral',
    status: 'inactive',
    interval: 'month',
    intervalCount: 3,
    billingType: 'prepaid',
    currency: 'BRL',
    paymentMethods: ['credit_card', 'boleto'],
    installments: [1],
    items: [{ name: 'Assinatura trimestral', quantity: 1, pricingScheme: 'unit' }],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
];

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

/** Tabela com planos */
export const Default: Story = {
  name: 'Default',
  render: () => (
    <PlansTable
      plans={samplePlans}
      onEdit={(plan) => console.log('edit', plan.id)}
      onArchive={(plan) => console.log('archive', plan.id)}
    />
  ),
};

/** Estado de carregamento */
export const Loading: Story = {
  name: 'Loading',
  render: () => (
    <PlansTable
      plans={[]}
      isLoading
      onEdit={() => undefined}
      onArchive={() => undefined}
    />
  ),
};

/** Estado vazio */
export const Empty: Story = {
  name: 'Empty',
  render: () => (
    <PlansTable
      plans={[]}
      isEmpty
      onEdit={() => undefined}
      onArchive={() => undefined}
    />
  ),
};

/** Estado de erro */
export const Error: Story = {
  name: 'Erro',
  render: () => (
    <PlansTable
      plans={[]}
      error="Não foi possível carregar os planos. Verifique sua conexão e tente novamente."
      onEdit={() => undefined}
      onArchive={() => undefined}
    />
  ),
};

/** Apenas um plano */
export const SinglePlan: Story = {
  name: 'Um Plano',
  render: () => (
    <PlansTable
      plans={[samplePlans[0]]}
      onEdit={() => undefined}
      onArchive={() => undefined}
    />
  ),
};
