/**
 * Storybook stories for PlanRow molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * NOTE: PlanRow uses Next.js Link, which requires a router context in Storybook.
 */

import type React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlanRow } from './PlanRow';
import type { PlanListItem } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Planos/Molecules/PlanRow',
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
  render?: () => React.ReactElement;
  name?: string;
};

// ---------------------------------------------------------------------------
// Mock data — no real personal data
// ---------------------------------------------------------------------------

const mockPlan: PlanListItem = {
  id: 'plan-uuid-exemplo-1',
  status: 'ativo',
  clientId: 'client-uuid-exemplo-1',
  clientName: 'Maria da Silva',
  petName: 'Rex',
  createdAt: '2026-04-01T10:00:00.000Z',
};

function PlanRowShell({ plan }: { plan: PlanListItem }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Pet</TableHead>
          <TableHead>Cadastrado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <PlanRow plan={plan} />
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Linha de plano com status ativo */
export const Default: Story = {
  name: 'Padrão (ativo)',
  render: () => <PlanRowShell plan={mockPlan} />,
};

/** Linha de plano com status pendente */
export const Pendente: Story = {
  name: 'Pendente',
  render: () => (
    <PlanRowShell plan={{ ...mockPlan, id: 'plan-uuid-exemplo-2', status: 'pendente' }} />
  ),
};

/** Linha de plano com status inadimplente */
export const Inadimplente: Story = {
  name: 'Inadimplente',
  render: () => (
    <PlanRowShell
      plan={{ ...mockPlan, id: 'plan-uuid-exemplo-3', status: 'inadimplente' }}
    />
  ),
};

/** Linha de plano com status cancelado */
export const Cancelado: Story = {
  name: 'Cancelado',
  render: () => (
    <PlanRowShell plan={{ ...mockPlan, id: 'plan-uuid-exemplo-4', status: 'cancelado' }} />
  ),
};
