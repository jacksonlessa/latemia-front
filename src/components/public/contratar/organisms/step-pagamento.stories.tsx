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

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

type Story = {
  render?: (args: StepPagamentoProps) => React.ReactElement;
  args?: Partial<StepPagamentoProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Shared handlers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Resumo com um único pet */
export const Default: Story = {
  name: 'Um pet',
  args: {
    summary: singlePetSummary,
    onNext: noop,
    onBack: noop,
  },
};

/** Resumo com múltiplos pets — total calculado corretamente */
export const MultiplosPets: Story = {
  name: 'Múltiplos pets',
  args: {
    summary: multiPetSummary,
    onNext: noop,
    onBack: noop,
  },
};

/** Botão desabilitado e texto "Aguarde..." enquanto submissão está em andamento */
export const Loading: Story = {
  name: 'Loading',
  args: {
    summary: singlePetSummary,
    onNext: noop,
    onBack: noop,
    isSubmitting: true,
  },
};

/** Mensagem de erro de rede exibida acima dos botões de navegação */
export const ErroDeRede: Story = {
  name: 'Erro de rede',
  args: {
    summary: singlePetSummary,
    onNext: noop,
    onBack: noop,
    formError: 'Ocorreu um erro inesperado. Tente novamente.',
  },
};
