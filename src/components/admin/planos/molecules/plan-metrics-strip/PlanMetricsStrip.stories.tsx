/**
 * Storybook stories for PlanMetricsStrip molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 */

import type React from 'react';
import { PlanMetricsStrip } from './PlanMetricsStrip';
import type { PlanDetail } from '@/lib/types/plan';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

const meta = {
  title: 'Admin - Planos/Molecules/PlanMetricsStrip',
  component: PlanMetricsStrip,
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

const baseUsage: BenefitUsageResponse = {
  id: 'usage-1',
  planId: basePlan.id,
  attendedAt: '2026-04-30T22:06:00Z',
  procedureDescription: 'Vacinação V10',
  isEmergency: false,
  totalValue: '150.00',
  discountApplied: '50.00',
  createdBy: 'user-1',
  updatedBy: null,
  creator: { id: 'user-1', name: 'Jackson Lessa' },
  updater: null,
  createdAt: '2026-04-30T22:06:00Z',
  updatedAt: '2026-04-30T22:06:00Z',
};

interface Args {
  plan: PlanDetail;
  benefitUsages: BenefitUsageResponse[];
}

type Story = {
  render?: (args: Args) => React.ReactElement;
  args?: Partial<Args>;
  name?: string;
};

export const Default: Story = {
  name: 'Em carência · 1 uso',
  args: {
    plan: basePlan,
    benefitUsages: [baseUsage],
  },
};

export const NoUsage: Story = {
  name: 'Em carência · sem usos',
  args: {
    plan: basePlan,
    benefitUsages: [],
  },
};

export const Pendente: Story = {
  name: 'Pendente · sem cobrança paga',
  args: {
    plan: {
      ...basePlan,
      status: 'pendente',
      firstPaidAt: undefined,
      gracePeriodEndsAt: undefined,
    },
    benefitUsages: [],
  },
};

export const GraceFinished: Story = {
  name: 'Carência encerrada (data passada)',
  args: {
    plan: {
      ...basePlan,
      status: 'ativo',
      gracePeriodEndsAt: '2025-01-01T00:00:00Z',
    },
    benefitUsages: [baseUsage, { ...baseUsage, id: 'usage-2', discountApplied: '120.00' }],
  },
};
