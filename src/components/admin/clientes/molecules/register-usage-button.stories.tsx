/**
 * Storybook stories for RegisterUsageButton molecule.
 * Covers every plan status + no-plan (undefined) case.
 *
 * Note: BenefitUsageModal uses fetch internally. In Storybook these stories
 * are presentational only — the modal will open but submissions won't reach
 * a real API.
 */

import type React from 'react';
import { RegisterUsageButton } from './register-usage-button';
import type { PlanSummary } from '@/lib/types/plan';

const meta = {
  title: 'Admin - Clientes/Molecules/RegisterUsageButton',
  component: RegisterUsageButton,
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

const basePlan: PlanSummary = {
  id: 'plan-1',
  status: 'ativo',
  petName: 'Rex',
  clientName: 'Maria Oliveira',
};

/** Plano ativo — abre BenefitUsageModal diretamente */
export const Ativo: Story = {
  name: 'Ativo (abre modal diretamente)',
  args: {
    plan: { ...basePlan, status: 'ativo' },
  },
};

/** Plano em carência — abre FrictionConfirmDialog primeiro */
export const Carencia: Story = {
  name: 'Carência (friction dialog)',
  args: {
    plan: { ...basePlan, id: 'plan-2', status: 'carencia' },
  },
};

/** Plano inadimplente — abre FrictionConfirmDialog primeiro */
export const Inadimplente: Story = {
  name: 'Inadimplente (friction dialog)',
  args: {
    plan: { ...basePlan, id: 'plan-3', status: 'inadimplente' },
  },
};

/** Plano pendente — botão desabilitado com tooltip */
export const Pendente: Story = {
  name: 'Pendente (desabilitado)',
  args: {
    plan: { ...basePlan, id: 'plan-4', status: 'pendente' },
  },
};

/** Plano cancelado — botão desabilitado com tooltip */
export const Cancelado: Story = {
  name: 'Cancelado (desabilitado)',
  args: {
    plan: { ...basePlan, id: 'plan-5', status: 'cancelado' },
  },
};

/** Plano estornado — botão desabilitado com tooltip */
export const Estornado: Story = {
  name: 'Estornado (desabilitado)',
  args: {
    plan: { ...basePlan, id: 'plan-6', status: 'estornado' },
  },
};

/** Plano contestado — botão desabilitado com tooltip */
export const Contestado: Story = {
  name: 'Contestado (desabilitado)',
  args: {
    plan: { ...basePlan, id: 'plan-7', status: 'contestado' },
  },
};

/** Sem plano — não renderiza nada */
export const SemPlano: Story = {
  name: 'Sem plano (não renderiza)',
  args: {
    plan: undefined,
  },
};
