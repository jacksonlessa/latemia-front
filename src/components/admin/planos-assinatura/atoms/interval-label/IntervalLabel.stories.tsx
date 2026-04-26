/**
 * Storybook stories for IntervalLabel atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { IntervalLabel } from './IntervalLabel';
import type { BillingInterval } from '@/lib/billing/types';

const meta = {
  title: 'Admin - Planos de Assinatura/Atoms/IntervalLabel',
  component: IntervalLabel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

interface IntervalLabelProps {
  interval: BillingInterval;
  intervalCount: number;
  className?: string;
}

type Story = {
  render?: (args: IntervalLabelProps) => React.ReactElement;
  args?: Partial<IntervalLabelProps>;
  name?: string;
};

/** Intervalo mensal (padrão) */
export const Monthly: Story = {
  name: 'Mensal',
  args: { interval: 'month', intervalCount: 1 },
};

/** Intervalo anual */
export const Yearly: Story = {
  name: 'Anual',
  args: { interval: 'year', intervalCount: 1 },
};

/** Intervalo semanal */
export const Weekly: Story = {
  name: 'Semanal',
  args: { interval: 'week', intervalCount: 1 },
};

/** Intervalo diário */
export const Daily: Story = {
  name: 'Diário',
  args: { interval: 'day', intervalCount: 1 },
};

/** Intervalo customizado: a cada 3 meses */
export const Every3Months: Story = {
  name: 'A cada 3 meses',
  args: { interval: 'month', intervalCount: 3 },
};

/** Todos os intervalos lado a lado */
export const AllIntervals: Story = {
  name: 'Todos os Intervalos',
  render: () => (
    <div className="flex flex-col gap-2">
      <IntervalLabel interval="day" intervalCount={1} />
      <IntervalLabel interval="week" intervalCount={1} />
      <IntervalLabel interval="month" intervalCount={1} />
      <IntervalLabel interval="year" intervalCount={1} />
      <IntervalLabel interval="month" intervalCount={3} />
      <IntervalLabel interval="week" intervalCount={2} />
    </div>
  ),
};
