/**
 * Storybook stories for the BenefitUsageForm organism.
 *
 * NOTE: Storybook is not yet configured in this project. These stories
 * follow CSF and are intended to be picked up automatically as soon as
 * Storybook is installed (mirrors the convention used by the other
 * uso-beneficio components and by `PlanForm.stories.tsx`).
 */

import type React from 'react';
import {
  BenefitUsageForm,
  type BenefitUsageFormProps,
} from './BenefitUsageForm';
import type { PlanSummary } from '@/lib/types/plan';
import type { BenefitUsageResponse } from '@/lib/types/benefit-usage';

const examplePlan: PlanSummary = {
  id: '11111111-2222-3333-4444-555555555555',
  status: 'ativo',
  petName: 'Tobias',
  clientName: 'Maria Silva',
};

const exampleUsage: BenefitUsageResponse = {
  id: '99999999-9999-9999-9999-999999999999',
  planId: examplePlan.id,
  attendedAt: '2026-04-29T13:30:00.000Z',
  procedureDescription: 'Consulta clínica + vacinação V10',
  isEmergency: false,
  totalValue: '350.00',
  discountApplied: '105.00',
  createdBy: 'usr_atendente1',
  updatedBy: null,
  creator: { id: 'usr_atendente1', name: 'Ana Souza' },
  updater: null,
  createdAt: '2026-04-29T13:35:00.000Z',
  updatedAt: '2026-04-29T13:35:00.000Z',
};

const noopAsync = async (): Promise<void> => {
  /* no-op for stories */
};

const meta = {
  title: 'Admin - Uso do Benefício/Organisms/BenefitUsageForm',
  component: BenefitUsageForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: BenefitUsageFormProps) => React.ReactElement | null;
  args?: Partial<BenefitUsageFormProps>;
  name?: string;
};

/** Default — plano `ativo`, sem erros. */
export const Default: Story = {
  name: 'Default (plano ativo)',
  args: {
    plan: examplePlan,
    onSubmit: noopAsync,
    onCancel: () => {
      /* no-op */
    },
    isSubmitting: false,
  },
};

/** Loading — submit em andamento, campos desabilitados. */
export const Loading: Story = {
  name: 'Loading (submitting)',
  args: {
    plan: examplePlan,
    onSubmit: noopAsync,
    onCancel: () => {
      /* no-op */
    },
    isSubmitting: true,
  },
};

/** Field error — backend devolveu erro mapeado para `discountApplied`. */
export const FieldError: Story = {
  name: 'Field error (discount > total)',
  args: {
    plan: examplePlan,
    onSubmit: noopAsync,
    onCancel: () => {
      /* no-op */
    },
    isSubmitting: false,
    fieldErrors: {
      discountApplied: 'O desconto não pode ser maior que o valor total.',
    },
  },
};

/** Generic error — banner topo (ex.: PLAN_STATUS_INVALID). */
export const GenericError: Story = {
  name: 'Generic error (top banner)',
  args: {
    plan: { ...examplePlan, status: 'inadimplente' },
    onSubmit: noopAsync,
    onCancel: () => {
      /* no-op */
    },
    isSubmitting: false,
    topErrorMessage:
      'Não é possível registrar uso para um plano com este status.',
  },
};

/** Edit mode — pré-preenche os campos a partir de um registro existente. */
export const EditMode: Story = {
  name: 'Edit mode (pré-preenchido)',
  args: {
    plan: examplePlan,
    mode: 'edit',
    initialValues: exampleUsage,
    onSubmit: noopAsync,
    onCancel: () => {
      /* no-op */
    },
    isSubmitting: false,
  },
};
