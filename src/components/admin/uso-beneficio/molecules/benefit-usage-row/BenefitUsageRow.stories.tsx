/**
 * Storybook stories for BenefitUsageRow molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { BenefitUsageRow } from './BenefitUsageRow';
import type { BenefitUsageRowProps } from './BenefitUsageRow';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

const meta = {
  title: 'Admin - Uso do Benefício/Molecules/BenefitUsageRow',
  component: BenefitUsageRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: BenefitUsageRowProps) => React.ReactElement;
  args?: Partial<BenefitUsageRowProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseUsage: BenefitUsageResponse = {
  id: 'usg_01HZX4K5EXAMPLE',
  planId: 'pln_01HZX4K5EXAMPLE',
  attendedAt: '2026-04-28T14:30:00.000Z',
  procedureDescription: 'Consulta clínica de rotina com vacinação V10',
  isEmergency: false,
  totalValue: '350.00',
  discountApplied: '105.00',
  createdBy: 'usr_atendente1',
  updatedBy: null,
  createdAt: '2026-04-28T14:35:00.000Z',
  updatedAt: '2026-04-28T14:35:00.000Z',
  creator: { id: 'usr_atendente1', name: 'Ana Souza' },
  updater: null,
};

const emergencyUsage: BenefitUsageResponse = {
  ...baseUsage,
  id: 'usg_01HZX4K6EXAMPLE',
  attendedAt: '2026-04-29T22:10:00.000Z',
  procedureDescription: 'Atendimento emergencial — torção gástrica',
  isEmergency: true,
  totalValue: '2480.00',
  discountApplied: '744.00',
};

const longDescriptionUsage: BenefitUsageResponse = {
  ...baseUsage,
  id: 'usg_01HZX4K7EXAMPLE',
  procedureDescription:
    'Consulta clínica completa com exames laboratoriais (hemograma, bioquímico hepático e renal), ultrassonografia abdominal, vacinação anual V10, antiparasitário oral e tópico, e orientação nutricional detalhada para pet idoso com histórico de pancreatite.',
};

const largeValueUsage: BenefitUsageResponse = {
  ...baseUsage,
  id: 'usg_01HZX4K8EXAMPLE',
  procedureDescription: 'Cirurgia ortopédica complexa com internação 3 dias',
  isEmergency: true,
  totalValue: '12999.90',
  discountApplied: '3899.97',
};

// ---------------------------------------------------------------------------
// Helper — wraps a row in a Table to keep semantics valid
// ---------------------------------------------------------------------------

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Procedimento</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Desconto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead className="w-12">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Linha padrão (eletivo, sem botão editar) */
export const Default: Story = {
  name: 'Default (sem edição)',
  render: () => (
    <TableShell>
      <BenefitUsageRow usage={baseUsage} canEdit={false} />
    </TableShell>
  ),
};

/** Linha com botão editar habilitado */
export const EditEnabled: Story = {
  name: 'Edição habilitada',
  render: () => (
    <TableShell>
      <BenefitUsageRow
        usage={baseUsage}
        canEdit
        onEdit={(usage) => console.log('edit', usage.id)}
      />
    </TableShell>
  ),
};

/** Linha com botão editar desabilitado (mesmo de Default, explicitando) */
export const EditDisabled: Story = {
  name: 'Edição desabilitada',
  render: () => (
    <TableShell>
      <BenefitUsageRow usage={baseUsage} canEdit={false} />
    </TableShell>
  ),
};

/** Atendimento emergencial */
export const Emergency: Story = {
  name: 'Emergência',
  render: () => (
    <TableShell>
      <BenefitUsageRow usage={emergencyUsage} canEdit />
    </TableShell>
  ),
};

/** Valores altos para verificar formatação BRL */
export const LargeValues: Story = {
  name: 'Valores grandes',
  render: () => (
    <TableShell>
      <BenefitUsageRow usage={largeValueUsage} canEdit />
    </TableShell>
  ),
};

/** Descrição longa truncada com tooltip nativo */
export const LongDescription: Story = {
  name: 'Descrição longa (truncada)',
  render: () => (
    <TableShell>
      <BenefitUsageRow usage={longDescriptionUsage} canEdit />
    </TableShell>
  ),
};

/** Lista combinada com múltiplas variantes */
export const Combined: Story = {
  name: 'Lista combinada',
  render: () => (
    <TableShell>
      <BenefitUsageRow
        usage={baseUsage}
        canEdit
        onEdit={(usage) => console.log('edit', usage.id)}
      />
      <BenefitUsageRow
        usage={emergencyUsage}
        canEdit
        onEdit={(usage) => console.log('edit', usage.id)}
      />
      <BenefitUsageRow
        usage={longDescriptionUsage}
        canEdit
        onEdit={(usage) => console.log('edit', usage.id)}
      />
      <BenefitUsageRow
        usage={largeValueUsage}
        canEdit
        onEdit={(usage) => console.log('edit', usage.id)}
      />
    </TableShell>
  ),
};
