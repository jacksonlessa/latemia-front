/**
 * Storybook stories for PlanStatusBadge atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PlanStatusBadge } from './PlanStatusBadge';
import type { PlanStatus } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Planos/Atoms/PlanStatusBadge',
  component: PlanStatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

interface PlanStatusBadgeProps {
  status: PlanStatus;
  className?: string;
}

type Story = {
  render?: (args: PlanStatusBadgeProps) => React.ReactElement;
  args?: Partial<PlanStatusBadgeProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Badge para plano pendente */
export const Pendente: Story = {
  name: 'Pendente',
  args: { status: 'pendente' },
};

/** Badge para plano em carência */
export const Carencia: Story = {
  name: 'Carência',
  args: { status: 'carencia' },
};

/** Badge para plano ativo */
export const Ativo: Story = {
  name: 'Ativo',
  args: { status: 'ativo' },
};

/** Badge para plano inadimplente */
export const Inadimplente: Story = {
  name: 'Inadimplente',
  args: { status: 'inadimplente' },
};

/** Badge para plano cancelado */
export const Cancelado: Story = {
  name: 'Cancelado',
  args: { status: 'cancelado' },
};
