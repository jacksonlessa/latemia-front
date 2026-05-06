/**
 * Storybook stories for StatusBadge atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF (Component Story Format) and will be picked up
 * automatically once Storybook is installed.
 */

import type React from 'react';
import { StatusBadge } from './StatusBadge';
import type { BillingPlanStatus } from '@/lib/billing/types';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Planos de Assinatura/Atoms/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

interface StatusBadgeProps {
  status: BillingPlanStatus;
  className?: string;
}

type Story = {
  render?: (args: StatusBadgeProps) => React.ReactElement;
  args?: Partial<StatusBadgeProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Badge para plano ativo */
export const Active: Story = {
  name: 'Active',
  args: { status: 'active' },
};

/** Badge para plano inativo */
export const Inactive: Story = {
  name: 'Inactive',
  args: { status: 'inactive' },
};

/** Todos os status lado a lado */
export const AllStatuses: Story = {
  name: 'Todos os Status',
  render: () => (
    <div className="flex gap-2">
      <StatusBadge status="active" />
      <StatusBadge status="inactive" />
    </div>
  ),
};
