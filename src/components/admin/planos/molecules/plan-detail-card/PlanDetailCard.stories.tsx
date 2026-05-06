/**
 * Storybook stories for PlanDetailCard molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PlanDetailCard } from './PlanDetailCard';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Planos/Molecules/PlanDetailCard',
  component: PlanDetailCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

interface PlanDetailCardProps {
  label: string;
  value: React.ReactNode;
}

type Story = {
  render?: (args: PlanDetailCardProps) => React.ReactElement;
  args?: Partial<PlanDetailCardProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Card com valor de texto simples */
export const Default: Story = {
  name: 'Valor texto',
  args: {
    label: 'Status',
    value: 'Pendente',
  },
};

/** Card com valor como nó React (ex.: badge) */
export const ComElemento: Story = {
  name: 'Valor como elemento React',
  render: () => (
    <PlanDetailCard
      label="Status"
      value={
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
          Pendente
        </span>
      }
    />
  ),
};

/** Card com valor vazio */
export const Vazio: Story = {
  name: 'Valor ausente',
  args: {
    label: 'Raça',
    value: '—',
  },
};

/** Múltiplos cards em grade */
export const EmGrade: Story = {
  name: 'Múltiplos em grade',
  render: () => (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PlanDetailCard label="ID" value="plan-uuid-exemplo" />
      <PlanDetailCard label="Status" value="Pendente" />
      <PlanDetailCard label="Criado em" value="1 de abril de 2026" />
    </dl>
  ),
};
