/**
 * Storybook stories for PlanTableRow molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlanTableRow } from './PlanTableRow';
import type { Plan } from '@/lib/billing/types';

const meta = {
  title: 'Admin - Planos de Assinatura/Molecules/PlanTableRow',
  component: PlanTableRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

const activePlan: Plan = {
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
};

const inactivePlan: Plan = {
  ...activePlan,
  id: 'plan_002',
  name: 'Plano Anual Premium',
  status: 'inactive',
  interval: 'year',
  intervalCount: 1,
  items: [{ name: 'Assinatura anual', quantity: 1, pricingScheme: 'unit' }],
};

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Intervalo</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

/** Linha de plano ativo */
export const Active: Story = {
  name: 'Plano Ativo',
  render: () => (
    <TableWrapper>
      <PlanTableRow plan={activePlan} onEdit={() => undefined} onArchive={() => undefined} />
    </TableWrapper>
  ),
};

/** Linha de plano inativo (ação arquivar desabilitada) */
export const Inactive: Story = {
  name: 'Plano Inativo',
  render: () => (
    <TableWrapper>
      <PlanTableRow plan={inactivePlan} onEdit={() => undefined} onArchive={() => undefined} />
    </TableWrapper>
  ),
};

/** Multiplas linhas */
export const MultipleRows: Story = {
  name: 'Múltiplas Linhas',
  render: () => (
    <TableWrapper>
      <PlanTableRow plan={activePlan} onEdit={() => undefined} onArchive={() => undefined} />
      <PlanTableRow plan={inactivePlan} onEdit={() => undefined} onArchive={() => undefined} />
    </TableWrapper>
  ),
};
