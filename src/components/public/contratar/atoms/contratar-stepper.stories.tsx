/**
 * Storybook stories for ContratarStepper atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { ContratarStepper } from './contratar-stepper';
import type { ContratarStepperProps } from './contratar-stepper';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/contratar/atoms/ContratarStepper',
  component: ContratarStepper,
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
  render?: (args: ContratarStepperProps) => React.ReactElement;
  args?: Partial<ContratarStepperProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

const STEPS = ['Cadastro', 'Pets', 'Contrato', 'Pagamento'];

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Passo 0 ativo — Cadastro em andamento, demais pendentes */
export const Step0Ativo: Story = {
  name: 'Passo 0 — Cadastro ativo',
  args: {
    steps: STEPS,
    current: 0,
  },
};

/** Passo 1 ativo — Cadastro concluído, Pets em andamento */
export const Step1Ativo: Story = {
  name: 'Passo 1 — Pets ativo',
  args: {
    steps: STEPS,
    current: 1,
  },
};

/** Passo 3 ativo — todos os passos anteriores concluídos */
export const Step3Completo: Story = {
  name: 'Passo 3 — Pagamento (último)',
  args: {
    steps: STEPS,
    current: 3,
  },
};
