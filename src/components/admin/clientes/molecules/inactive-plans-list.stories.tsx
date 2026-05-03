/**
 * Storybook stories for InactivePlansList molecule.
 */

import type React from 'react';
import { InactivePlansList, type InactivePlanSummary } from './inactive-plans-list';

const meta = {
  title: 'Admin - Clientes/Molecules/InactivePlansList',
  component: InactivePlansList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = {
  render?: (args: unknown) => React.ReactElement;
  args?: Record<string, unknown>;
  name?: string;
};

const mockPlans: InactivePlanSummary[] = [
  {
    id: 'plan-abc-123',
    status: 'cancelado',
    createdAt: '2023-06-15T10:00:00.000Z',
    usagesCount: 12,
  },
  {
    id: 'plan-def-456',
    status: 'estornado',
    createdAt: '2022-11-01T10:00:00.000Z',
    usagesCount: 3,
  },
  {
    id: 'plan-ghi-789',
    status: 'contestado',
    createdAt: '2022-04-20T10:00:00.000Z',
    usagesCount: 0,
  },
];

/** Lista com múltiplos planos inativos */
export const Default: Story = {
  name: 'Default (múltiplos planos)',
  args: {
    plans: mockPlans,
  },
};

/** Apenas um plano cancelado */
export const UmPlanoCancelado: Story = {
  name: 'Um plano cancelado',
  args: {
    plans: [mockPlans[0]],
  },
};

/** Plano com 1 uso (plural/singular) */
export const UmUso: Story = {
  name: '1 uso (singular)',
  args: {
    plans: [
      {
        id: 'plan-xyz',
        status: 'cancelado',
        createdAt: '2024-01-01T00:00:00.000Z',
        usagesCount: 1,
      },
    ],
  },
};

/** Lista vazia — não renderiza nada */
export const Empty: Story = {
  name: 'Vazio (sem histórico)',
  args: {
    plans: [],
  },
};
