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

const examplePlan: PlanSummary = {
  id: '11111111-2222-3333-4444-555555555555',
  status: 'ativo',
  petName: 'Tobias',
  clientName: 'Maria Silva',
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
