/**
 * Storybook stories for PlanForm organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { PlanForm } from './PlanForm';
import type { Plan } from '@/lib/billing/types';

const meta = {
  title: 'Admin - Planos de Assinatura/Organisms/PlanForm',
  component: PlanForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

const existingPlan: Plan = {
  id: 'plan_001',
  name: 'Plano Mensal Básico',
  description: 'Plano de assinatura mensal com cobrança no cartão',
  status: 'active',
  interval: 'month',
  intervalCount: 1,
  billingType: 'prepaid',
  currency: 'BRL',
  paymentMethods: ['credit_card', 'boleto'],
  installments: [1],
  items: [
    { id: 'item_001', name: 'Assinatura mensal', quantity: 1, pricingScheme: 'unit' },
  ],
  minimumPrice: 9990,
  negotiable: false,
  paymentAttempts: 3,
  createdAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-01-10T10:00:00Z',
};

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

/** Formulário de criação (sem dados iniciais) */
export const Create: Story = {
  name: 'Criar Plano',
  render: () => (
    <div className="max-w-2xl">
      <PlanForm onSubmit={(data) => console.log('submit', data)} />
    </div>
  ),
};

/** Formulário de edição (com dados iniciais) */
export const Edit: Story = {
  name: 'Editar Plano',
  render: () => (
    <div className="max-w-2xl">
      <PlanForm initialData={existingPlan} onSubmit={(data) => console.log('submit', data)} />
    </div>
  ),
};

/** Estado de loading / salvando */
export const Loading: Story = {
  name: 'Loading (Salvando)',
  render: () => (
    <div className="max-w-2xl">
      <PlanForm
        initialData={existingPlan}
        onSubmit={() => undefined}
        isLoading
      />
    </div>
  ),
};

/** Estado de erro após submit */
export const Error: Story = {
  name: 'Erro ao salvar',
  render: () => (
    <div className="max-w-2xl">
      <PlanForm
        initialData={existingPlan}
        onSubmit={(data) => console.log('submit', data)}
        errorMessage="Não foi possível salvar o plano. Verifique os dados e tente novamente."
      />
    </div>
  ),
};
