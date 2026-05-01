/**
 * Storybook stories for PlanDetailHeader molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 */

import type React from 'react';
import { PlanDetailHeader } from './PlanDetailHeader';
import type { PlanDetail } from '@/lib/types/plan';

const meta = {
  title: 'Admin - Planos/Molecules/PlanDetailHeader',
  component: PlanDetailHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

const basePlan: PlanDetail = {
  id: 'f3bf4448-25f8-4432-9587-a51f34c8ceeb',
  status: 'carencia',
  createdAt: '2026-05-01T01:08:00Z',
  pagarmeSubscriptionId: 'sub_5dVvVNRf3Cs9Lu86',
  firstPaidAt: '2026-05-01T01:08:00Z',
  gracePeriodEndsAt: '2026-11-01T01:08:00Z',
  pet: {
    name: 'Lucca',
    species: 'canino',
    breed: 'SRD',
    weight: 4,
    castrated: false,
    birthDate: '2022-04-30',
  },
  client: {
    id: 'client-1',
    name: 'Aparecida Sabrina',
    email: 's***@email.com',
    phone: '(11) 9****-4321',
  },
  contract: {
    id: '2ba93930-a139-4242-943a-6718bbcb48ab',
    version: 'v1.0',
    consentedAt: '2026-05-01T01:08:00Z',
  },
  payments: [
    {
      id: 'pay-1',
      status: 'pago',
      amount: 2.5,
      createdAt: '2026-05-01T01:09:00Z',
      paidAt: '2026-05-01T01:08:00Z',
    },
  ],
};

interface Args {
  plan: PlanDetail;
  onRegisterUsageClick: () => void;
}

type Story = {
  render?: (args: Args) => React.ReactElement;
  args?: Partial<Args>;
  name?: string;
};

const noop = () => {};

export const Carencia: Story = {
  name: 'Em carência (registrar uso liberado)',
  args: { plan: basePlan, onRegisterUsageClick: noop },
};

export const Pendente: Story = {
  name: 'Pendente (registrar uso bloqueado)',
  args: {
    plan: { ...basePlan, status: 'pendente', firstPaidAt: undefined },
    onRegisterUsageClick: noop,
  },
};

export const Cancelado: Story = {
  name: 'Cancelado (registrar uso bloqueado)',
  args: {
    plan: { ...basePlan, status: 'cancelado' },
    onRegisterUsageClick: noop,
  },
};

export const SemSubscriptionId: Story = {
  name: 'Sem ID Pagar.me (botão de copiar oculto)',
  args: {
    plan: { ...basePlan, pagarmeSubscriptionId: undefined },
    onRegisterUsageClick: noop,
  },
};
