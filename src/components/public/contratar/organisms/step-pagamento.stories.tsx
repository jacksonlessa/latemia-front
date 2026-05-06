/**
 * Storybook stories for StepPagamento organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { StepPagamento } from './step-pagamento';
import type { StepPagamentoProps } from './step-pagamento';
import type { CheckoutSummary } from '@/domain/checkout/checkout.types';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/contratar/organisms/StepPagamento',
  component: StepPagamento,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = {
  render?: (args: StepPagamentoProps) => React.ReactElement;
  args?: Partial<StepPagamentoProps>;
  name?: string;
};

const noop = () => {};

const singlePetSummary: CheckoutSummary = {
  clientName: 'Maria da Silva',
  pets: [{ name: 'Rex', species: 'canino' }],
  pricePerPetCents: 2500,
  totalCents: 2500,
};

const multiPetSummary: CheckoutSummary = {
  clientName: 'João Pereira',
  pets: [
    { name: 'Rex', species: 'canino' },
    { name: 'Mimi', species: 'felino' },
    { name: 'Thor', species: 'canino' },
  ],
  pricePerPetCents: 2500,
  totalCents: 7500,
};

export const Default: Story = {
  name: 'Form — um pet',
  args: {
    summary: singlePetSummary,
    onSubmit: noop,
    onBack: noop,
  },
};

export const MultiplosPets: Story = {
  name: 'Form — múltiplos pets',
  args: {
    summary: multiPetSummary,
    onSubmit: noop,
    onBack: noop,
  },
};

export const Processing: Story = {
  name: 'Processing (stage 5)',
  args: {
    summary: singlePetSummary,
    onSubmit: noop,
    onBack: noop,
    mode: 'processing',
    currentStage: 5,
    petStages: [{ name: 'Rex', state: 'pending' }],
  },
};

export const Erro: Story = {
  name: 'Erro (stage 6 — cartão recusado)',
  args: {
    summary: singlePetSummary,
    onSubmit: noop,
    onBack: noop,
    onRetry: noop,
    mode: 'error',
    currentStage: 6,
    errorStage: 6,
    errorMessage: 'Seu cartão foi recusado. Verifique os dados ou tente outro cartão.',
    petStages: [{ name: 'Rex', state: 'error' }],
  },
};

export const ErroDeRede: Story = {
  name: 'Erro de rede (inline)',
  args: {
    summary: singlePetSummary,
    onSubmit: noop,
    onBack: noop,
    formError: 'Ocorreu um erro inesperado. Tente novamente.',
  },
};
