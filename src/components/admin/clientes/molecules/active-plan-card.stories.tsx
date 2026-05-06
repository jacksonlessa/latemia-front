/**
 * Storybook stories for ActivePlanCard molecule.
 * Covers: ativo, carencia, inadimplente, pendente, loading, sem plano.
 */

import type React from 'react';
import { ActivePlanCard, type ActivePlanDetail } from './active-plan-card';

const meta = {
  title: 'Admin - Clientes/Molecules/ActivePlanCard',
  component: ActivePlanCard,
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

const basePlan: ActivePlanDetail = {
  id: 'plan-1',
  status: 'ativo',
  createdAt: '2024-01-15T10:00:00.000Z',
  gracePeriodEndsAt: '2024-07-15T10:00:00.000Z',
  payments: [
    {
      id: 'pay-1',
      status: 'pago',
      amount: 9900,
      createdAt: '2024-04-01T10:00:00.000Z',
      paidAt: '2024-04-01T10:05:00.000Z',
    },
    {
      id: 'pay-2',
      status: 'pago',
      amount: 9900,
      createdAt: '2024-05-01T10:00:00.000Z',
      paidAt: '2024-05-01T10:05:00.000Z',
    },
  ],
};

/** Plano ativo */
export const Ativo: Story = {
  name: 'Ativo',
  args: {
    plan: basePlan,
    usagesCount: 7,
    loading: false,
  },
};

/** Plano em carência */
export const Carencia: Story = {
  name: 'Carência',
  args: {
    plan: {
      ...basePlan,
      id: 'plan-2',
      status: 'carencia',
      gracePeriodEndsAt: '2025-06-01T00:00:00.000Z',
    },
    usagesCount: 2,
    loading: false,
  },
};

/** Plano inadimplente */
export const Inadimplente: Story = {
  name: 'Inadimplente',
  args: {
    plan: {
      ...basePlan,
      id: 'plan-3',
      status: 'inadimplente',
      payments: [
        {
          id: 'pay-3',
          status: 'inadimplente',
          amount: 9900,
          createdAt: '2024-03-01T10:00:00.000Z',
        },
      ],
    },
    usagesCount: 3,
    loading: false,
  },
};

/** Plano pendente */
export const Pendente: Story = {
  name: 'Pendente',
  args: {
    plan: {
      ...basePlan,
      id: 'plan-4',
      status: 'pendente',
      gracePeriodEndsAt: undefined,
      payments: [],
    },
    usagesCount: 0,
    loading: false,
  },
};

/** Estado de loading — skeletons */
export const Loading: Story = {
  name: 'Loading',
  args: {
    plan: null,
    usagesCount: null,
    loading: true,
  },
};

/** Sem plano vigente */
export const SemPlano: Story = {
  name: 'Sem plano',
  args: {
    plan: null,
    usagesCount: null,
    loading: false,
  },
};

/** Plano ativo sem dados de carência */
export const SemCarencia: Story = {
  name: 'Ativo sem dados de carência',
  args: {
    plan: {
      ...basePlan,
      gracePeriodEndsAt: undefined,
    },
    usagesCount: 0,
    loading: false,
  },
};
