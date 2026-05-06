/**
 * Storybook stories for PlanMetricCard atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up automatically once installed.
 */

import type React from 'react';
import { PlanMetricCard } from './PlanMetricCard';

const meta = {
  title: 'Admin - Planos/Atoms/PlanMetricCard',
  component: PlanMetricCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

interface Args {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  variant?: 'default' | 'success' | 'warn';
}

type Story = {
  render?: (args: Args) => React.ReactElement;
  args?: Partial<Args>;
  name?: string;
};

export const Default: Story = {
  name: 'Default',
  args: {
    label: 'Criado em',
    value: '1 mai 2026',
    sub: '01:08',
  },
};

export const Success: Story = {
  name: 'Success — Primeira cobrança paga',
  args: {
    label: 'Primeira cobrança',
    value: '1 mai 2026',
    sub: 'Paga · R$ 2,50',
    variant: 'success',
  },
};

export const Warn: Story = {
  name: 'Warn — Carência em curso',
  args: {
    label: 'Carência termina',
    value: '1 nov 2026',
    sub: '6 meses restantes',
    variant: 'warn',
  },
};

export const NumericValue: Story = {
  name: 'Numeric — Uso do benefício',
  args: {
    label: 'Uso do benefício',
    value: '1',
    sub: 'R$ 50 em descontos',
  },
};

export const Empty: Story = {
  name: 'Empty — sem subtitle',
  args: {
    label: 'Indisponível',
    value: '—',
  },
};
